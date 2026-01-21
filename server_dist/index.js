var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express from "express";

// server/routes.ts
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import crypto2 from "node:crypto";

// server/db.ts
import "dotenv/config";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  adminConversations: () => adminConversations,
  adminMessages: () => adminMessages,
  appFeedback: () => appFeedback,
  appSettings: () => appSettings,
  checklistTasks: () => checklistTasks,
  conversations: () => conversations,
  coordinatorInvitations: () => coordinatorInvitations,
  coupleLoginSchema: () => coupleLoginSchema,
  coupleProfiles: () => coupleProfiles,
  coupleSessions: () => coupleSessions,
  coupleVendorContracts: () => coupleVendorContracts,
  createChecklistTaskSchema: () => createChecklistTaskSchema,
  createCoordinatorInvitationSchema: () => createCoordinatorInvitationSchema,
  createDeliverySchema: () => createDeliverySchema,
  createGuestInvitationSchema: () => createGuestInvitationSchema,
  createInquirySchema: () => createInquirySchema,
  createInspirationSchema: () => createInspirationSchema,
  createOfferSchema: () => createOfferSchema,
  createReminderSchema: () => createReminderSchema,
  createSpeechSchema: () => createSpeechSchema,
  createVendorProductSchema: () => createVendorProductSchema,
  deliveries: () => deliveries,
  deliveryItems: () => deliveryItems,
  faqItems: () => faqItems,
  guestInvitations: () => guestInvitations,
  insertAppFeedbackSchema: () => insertAppFeedbackSchema,
  insertAppSettingSchema: () => insertAppSettingSchema,
  insertChecklistTaskSchema: () => insertChecklistTaskSchema,
  insertCoordinatorInvitationSchema: () => insertCoordinatorInvitationSchema,
  insertCoupleProfileSchema: () => insertCoupleProfileSchema,
  insertCoupleVendorContractSchema: () => insertCoupleVendorContractSchema,
  insertDeliveryItemSchema: () => insertDeliveryItemSchema,
  insertDeliverySchema: () => insertDeliverySchema,
  insertFaqItemSchema: () => insertFaqItemSchema,
  insertGuestInvitationSchema: () => insertGuestInvitationSchema,
  insertInspirationCategorySchema: () => insertInspirationCategorySchema,
  insertInspirationMediaSchema: () => insertInspirationMediaSchema,
  insertInspirationSchema: () => insertInspirationSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertReminderSchema: () => insertReminderSchema,
  insertScheduleEventSchema: () => insertScheduleEventSchema,
  insertSpeechSchema: () => insertSpeechSchema,
  insertSubscriptionTierSchema: () => insertSubscriptionTierSchema,
  insertTableSeatingInvitationSchema: () => insertTableSeatingInvitationSchema,
  insertUserSchema: () => insertUserSchema,
  insertVendorCategorySchema: () => insertVendorCategorySchema,
  insertVendorOfferItemSchema: () => insertVendorOfferItemSchema,
  insertVendorOfferSchema: () => insertVendorOfferSchema,
  insertVendorPaymentSchema: () => insertVendorPaymentSchema,
  insertVendorProductSchema: () => insertVendorProductSchema,
  insertVendorReviewResponseSchema: () => insertVendorReviewResponseSchema,
  insertVendorReviewSchema: () => insertVendorReviewSchema,
  insertVendorSchema: () => insertVendorSchema,
  insertVendorSubscriptionSchema: () => insertVendorSubscriptionSchema,
  insertVendorUsageSchema: () => insertVendorUsageSchema,
  insertVideoGuideSchema: () => insertVideoGuideSchema,
  insertWeddingGuestSchema: () => insertWeddingGuestSchema,
  insertWeddingTableSchema: () => insertWeddingTableSchema,
  insertWhatsNewSchema: () => insertWhatsNewSchema,
  inspirationCategories: () => inspirationCategories,
  inspirationInquiries: () => inspirationInquiries,
  inspirationMedia: () => inspirationMedia,
  inspirations: () => inspirations,
  messageReminders: () => messageReminders,
  messages: () => messages,
  notifications: () => notifications,
  reminders: () => reminders,
  scheduleEvents: () => scheduleEvents,
  sendAdminMessageSchema: () => sendAdminMessageSchema,
  sendMessageSchema: () => sendMessageSchema,
  speeches: () => speeches,
  subscriptionTiers: () => subscriptionTiers,
  tableGuestAssignments: () => tableGuestAssignments,
  tableSeatingInvitations: () => tableSeatingInvitations,
  updateAppSettingSchema: () => updateAppSettingSchema,
  updateFaqItemSchema: () => updateFaqItemSchema,
  updateSubscriptionTierSchema: () => updateSubscriptionTierSchema,
  updateVideoGuideSchema: () => updateVideoGuideSchema,
  updateWeddingGuestSchema: () => updateWeddingGuestSchema,
  updateWhatsNewSchema: () => updateWhatsNewSchema,
  users: () => users,
  vendorCategories: () => vendorCategories,
  vendorFeatures: () => vendorFeatures,
  vendorInspirationCategories: () => vendorInspirationCategories,
  vendorOfferItems: () => vendorOfferItems,
  vendorOffers: () => vendorOffers,
  vendorPayments: () => vendorPayments,
  vendorProducts: () => vendorProducts,
  vendorRegistrationSchema: () => vendorRegistrationSchema,
  vendorReviewResponses: () => vendorReviewResponses,
  vendorReviews: () => vendorReviews,
  vendorSessions: () => vendorSessions,
  vendorSubscriptions: () => vendorSubscriptions,
  vendorUsageMetrics: () => vendorUsageMetrics,
  vendors: () => vendors,
  videoGuides: () => videoGuides,
  weddingGuests: () => weddingGuests,
  weddingTables: () => weddingTables,
  whatsNewItems: () => whatsNewItems
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var vendorCategories = pgTable("vendor_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description")
});
var vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  organizationNumber: text("organization_number"),
  categoryId: varchar("category_id").references(() => vendorCategories.id),
  description: text("description"),
  location: text("location"),
  phone: text("phone"),
  website: text("website"),
  priceRange: text("price_range"),
  imageUrl: text("image_url"),
  googleReviewUrl: text("google_review_url"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var vendorSessions = pgTable("vendor_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertVendorCategorySchema = createInsertSchema(vendorCategories).pick({
  name: true,
  icon: true,
  description: true
});
var insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  status: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true
});
var vendorRegistrationSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Passord m\xE5 v\xE6re minst 8 tegn"),
  businessName: z.string().min(2, "Bedriftsnavn m\xE5 v\xE6re minst 2 tegn"),
  organizationNumber: z.string().optional(),
  categoryId: z.string().min(1, "Velg en kategori"),
  description: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  priceRange: z.string().optional()
});
var vendorFeatures = pgTable("vendor_features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  featureKey: text("feature_key").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var vendorInspirationCategories = pgTable("vendor_inspiration_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => inspirationCategories.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow()
});
var deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  coupleName: text("couple_name").notNull(),
  coupleEmail: text("couple_email"),
  accessCode: text("access_code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  weddingDate: text("wedding_date"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var deliveryItems = pgTable("delivery_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deliveryId: varchar("delivery_id").notNull().references(() => deliveries.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  accessCode: true,
  status: true,
  createdAt: true,
  updatedAt: true
});
var insertDeliveryItemSchema = createInsertSchema(deliveryItems).omit({
  id: true,
  createdAt: true
});
var createDeliverySchema = z.object({
  coupleName: z.string().min(2, "Navn m\xE5 v\xE6re minst 2 tegn"),
  coupleEmail: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  title: z.string().min(2, "Tittel m\xE5 v\xE6re minst 2 tegn"),
  description: z.string().optional(),
  weddingDate: z.string().optional(),
  items: z.array(z.object({
    type: z.enum(["gallery", "video", "website", "download", "other"]),
    label: z.string().min(1, "Etikett er p\xE5krevd"),
    url: z.string().url("Ugyldig URL"),
    description: z.string().optional()
  })).min(1, "Legg til minst \xE9n leveranse")
});
var inspirationCategories = pgTable("inspiration_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").default(0)
});
var inspirations = pgTable("inspirations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").references(() => inspirationCategories.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  priceSummary: text("price_summary"),
  priceMin: integer("price_min"),
  priceMax: integer("price_max"),
  currency: text("currency").default("NOK"),
  websiteUrl: text("website_url"),
  inquiryEmail: text("inquiry_email"),
  inquiryPhone: text("inquiry_phone"),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  allowInquiryForm: boolean("allow_inquiry_form").default(false),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var inspirationMedia = pgTable("inspiration_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inspirationId: varchar("inspiration_id").notNull().references(() => inspirations.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var insertInspirationCategorySchema = createInsertSchema(inspirationCategories).omit({
  id: true
});
var insertInspirationSchema = createInsertSchema(inspirations).omit({
  id: true,
  status: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true
});
var insertInspirationMediaSchema = createInsertSchema(inspirationMedia).omit({
  id: true,
  createdAt: true
});
var createInspirationSchema = z.object({
  categoryId: z.string().min(1, "Velg en kategori"),
  title: z.string().min(2, "Tittel m\xE5 v\xE6re minst 2 tegn"),
  description: z.string().optional(),
  coverImageUrl: z.string().url("Ugyldig URL").optional().or(z.literal("")),
  priceSummary: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  currency: z.string().default("NOK"),
  websiteUrl: z.string().url("Ugyldig URL").optional().or(z.literal("")),
  inquiryEmail: z.string().email("Ugyldig e-post").optional().or(z.literal("")),
  inquiryPhone: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().url("Ugyldig URL").optional().or(z.literal("")),
  allowInquiryForm: z.boolean().default(false),
  media: z.array(z.object({
    type: z.enum(["image", "video"]),
    url: z.string().url("Ugyldig URL"),
    caption: z.string().optional()
  })).min(1, "Legg til minst ett bilde eller video")
});
var inspirationInquiries = pgTable("inspiration_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inspirationId: varchar("inspiration_id").notNull().references(() => inspirations.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  weddingDate: text("wedding_date"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow()
});
var createInquirySchema = z.object({
  inspirationId: z.string(),
  name: z.string().min(2, "Navn m\xE5 v\xE6re minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().optional(),
  message: z.string().min(10, "Melding m\xE5 v\xE6re minst 10 tegn"),
  weddingDate: z.string().optional()
});
var checklistTasks = pgTable("checklist_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  monthsBefore: integer("months_before").notNull().default(12),
  category: text("category").notNull().default("planning"),
  // planning, vendors, attire, logistics, final
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by"),
  // coupleId who completed it
  assignedTo: varchar("assigned_to"),
  // Optional: assign to partner
  notes: text("notes"),
  linkedReminderId: varchar("linked_reminder_id").references(() => reminders.id),
  isDefault: boolean("is_default").notNull().default(false),
  // True for system-generated tasks
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertChecklistTaskSchema = createInsertSchema(checklistTasks).omit({
  id: true,
  completedAt: true,
  completedBy: true,
  createdAt: true,
  updatedAt: true
});
var createChecklistTaskSchema = z.object({
  title: z.string().min(1, "Tittel er p\xE5krevd"),
  monthsBefore: z.number().min(0).max(24).default(12),
  category: z.enum(["planning", "vendors", "attire", "logistics", "final"]).default("planning"),
  notes: z.string().optional(),
  assignedTo: z.string().optional()
});
var coupleProfiles = pgTable("couple_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  password: text("password").notNull(),
  partnerEmail: text("partner_email"),
  weddingDate: text("wedding_date"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coupleSessions = pgTable("couple_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  inspirationId: varchar("inspiration_id").references(() => inspirations.id, { onDelete: "set null" }),
  inquiryId: varchar("inquiry_id").references(() => inspirationInquiries.id, { onDelete: "set null" }),
  status: text("status").notNull().default("active"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  coupleUnreadCount: integer("couple_unread_count").default(0),
  vendorUnreadCount: integer("vendor_unread_count").default(0),
  coupleTypingAt: timestamp("couple_typing_at"),
  vendorTypingAt: timestamp("vendor_typing_at"),
  createdAt: timestamp("created_at").defaultNow(),
  deletedByCouple: boolean("deleted_by_couple").default(false),
  deletedByVendor: boolean("deleted_by_vendor").default(false),
  coupleDeletedAt: timestamp("couple_deleted_at"),
  vendorDeletedAt: timestamp("vendor_deleted_at")
});
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderType: text("sender_type").notNull(),
  // 'couple' or 'vendor'
  senderId: varchar("sender_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  editedAt: timestamp("edited_at"),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"),
  deletedByCouple: boolean("deleted_by_couple").default(false),
  deletedByVendor: boolean("deleted_by_vendor").default(false),
  coupleDeletedAt: timestamp("couple_deleted_at"),
  vendorDeletedAt: timestamp("vendor_deleted_at")
});
var adminConversations = pgTable("admin_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  vendorUnreadCount: integer("vendor_unread_count").default(0),
  adminUnreadCount: integer("admin_unread_count").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var adminMessages = pgTable("admin_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => adminConversations.id, { onDelete: "cascade" }),
  senderType: text("sender_type").notNull(),
  // 'vendor' or 'admin'
  senderId: varchar("sender_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  editedAt: timestamp("edited_at"),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type")
});
var sendAdminMessageSchema = z.object({
  conversationId: z.string().optional(),
  body: z.string().min(1, "Melding er p\xE5krevd"),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional()
});
var insertCoupleProfileSchema = createInsertSchema(coupleProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var coupleLoginSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  displayName: z.string().min(2, "Navn m\xE5 v\xE6re minst 2 tegn"),
  password: z.string().min(8, "Passord m\xE5 v\xE6re minst 8 tegn")
});
var sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  vendorId: z.string().optional(),
  inspirationId: z.string().optional(),
  body: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional()
}).refine((data) => data.body || data.attachmentUrl, "Melding eller vedlegg er p\xE5krevd");
var reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  reminderDate: timestamp("reminder_date").notNull(),
  category: text("category").notNull().default("general"),
  isCompleted: boolean("is_completed").default(false),
  notificationId: text("notification_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  isCompleted: true,
  notificationId: true,
  createdAt: true,
  updatedAt: true
});
var createReminderSchema = z.object({
  title: z.string().min(1, "Tittel er p\xE5krevd"),
  description: z.string().optional(),
  reminderDate: z.string(),
  category: z.enum(["general", "vendor", "budget", "guest", "planning"]).default("general")
});
var vendorProducts = pgTable("vendor_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  unitPrice: integer("unit_price").notNull(),
  // Price in øre (NOK cents)
  unitType: text("unit_type").notNull().default("stk"),
  // stk, time, dag, pakke, etc.
  leadTimeDays: integer("lead_time_days"),
  minQuantity: integer("min_quantity").default(1),
  categoryTag: text("category_tag"),
  // Internal categorization
  imageUrl: text("image_url"),
  isArchived: boolean("is_archived").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertVendorProductSchema = createInsertSchema(vendorProducts).omit({
  id: true,
  isArchived: true,
  createdAt: true,
  updatedAt: true
});
var createVendorProductSchema = z.object({
  title: z.string().min(2, "Tittel m\xE5 v\xE6re minst 2 tegn"),
  description: z.string().optional(),
  unitPrice: z.number().min(0, "Pris m\xE5 v\xE6re 0 eller h\xF8yere"),
  unitType: z.string().default("stk"),
  leadTimeDays: z.number().min(0).optional(),
  minQuantity: z.number().min(1).default(1),
  categoryTag: z.string().optional(),
  imageUrl: z.string().url("Ugyldig URL").optional().or(z.literal("")),
  sortOrder: z.number().default(0)
});
var vendorOffers = pgTable("vendor_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  // pending, accepted, declined, expired
  totalAmount: integer("total_amount").notNull(),
  // In øre
  currency: text("currency").default("NOK"),
  validUntil: timestamp("valid_until"),
  acceptedAt: timestamp("accepted_at"),
  declinedAt: timestamp("declined_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var vendorOfferItems = pgTable("vendor_offer_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => vendorOffers.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => vendorProducts.id, { onDelete: "set null" }),
  // Optional - can be custom line
  title: text("title").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(),
  // In øre
  lineTotal: integer("line_total").notNull(),
  // quantity * unitPrice
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var insertVendorOfferSchema = createInsertSchema(vendorOffers).omit({
  id: true,
  status: true,
  acceptedAt: true,
  declinedAt: true,
  createdAt: true,
  updatedAt: true
});
var insertVendorOfferItemSchema = createInsertSchema(vendorOfferItems).omit({
  id: true,
  createdAt: true
});
var createOfferSchema = z.object({
  coupleId: z.string().min(1, "Velg en mottaker"),
  conversationId: z.string().optional(),
  title: z.string().min(2, "Tittel m\xE5 v\xE6re minst 2 tegn"),
  message: z.string().optional(),
  validUntil: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().optional(),
    title: z.string().min(1, "Tittel er p\xE5krevd"),
    description: z.string().optional(),
    quantity: z.number().min(1).default(1),
    unitPrice: z.number().min(0, "Pris m\xE5 v\xE6re 0 eller h\xF8yere")
  })).min(1, "Legg til minst \xE9n linje")
});
var speeches = pgTable("speeches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => coupleProfiles.id, { onDelete: "cascade" }),
  speakerName: text("speaker_name").notNull(),
  role: text("role"),
  // brudgom, brud, forlovere, foreldre, etc.
  durationMinutes: integer("duration_minutes").notNull().default(5),
  sortOrder: integer("sort_order").notNull().default(0),
  notes: text("notes"),
  scheduledTime: text("scheduled_time"),
  // Optional specific time slot
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertSpeechSchema = createInsertSchema(speeches).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var createSpeechSchema = z.object({
  speakerName: z.string().min(1, "Navn er p\xE5krevd"),
  role: z.string().optional(),
  durationMinutes: z.number().min(1).max(60).default(5),
  sortOrder: z.number().default(0),
  notes: z.string().optional(),
  scheduledTime: z.string().optional()
});
var messageReminders = pgTable("message_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  reminderType: text("reminder_type").notNull().default("gentle"),
  // gentle, deadline, final
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: text("status").notNull().default("pending"),
  // pending, sent, cancelled
  createdAt: timestamp("created_at").defaultNow()
});
var appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull().default("general"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertAppSettingSchema = createInsertSchema(appSettings).omit({
  id: true,
  updatedAt: true
});
var updateAppSettingSchema = z.object({
  value: z.string().min(1, "Verdi er p\xE5krevd")
});
var whatsNewItems = pgTable("whats_new_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull().default("vendor"),
  // vendor or couple
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("star"),
  minAppVersion: text("min_app_version").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertWhatsNewSchema = createInsertSchema(whatsNewItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  category: z.enum(["vendor", "couple"]).default("vendor")
});
var updateWhatsNewSchema = z.object({
  category: z.enum(["vendor", "couple"]).default("vendor"),
  title: z.string().min(1, "Tittel er p\xE5krevd"),
  description: z.string().min(1, "Beskrivelse er p\xE5krevd"),
  icon: z.string().default("star"),
  minAppVersion: z.string().min(1, "Minimumversjon er p\xE5krevd"),
  isActive: z.boolean(),
  sortOrder: z.number().int()
});
var scheduleEvents = pgTable("schedule_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  time: text("time").notNull(),
  // HH:mm format
  title: text("title").notNull(),
  icon: text("icon").default("star"),
  // heart, camera, music, users, coffee, sun, moon, star
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertScheduleEventSchema = createInsertSchema(scheduleEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var coordinatorInvitations = pgTable("coordinator_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  email: text("email"),
  name: text("name").notNull(),
  // Display name like "Toastmaster Ole"
  roleLabel: text("role_label").notNull().default("Toastmaster"),
  // Toastmaster, Koordinator, etc.
  accessToken: text("access_token").notNull().unique(),
  accessCode: text("access_code"),
  // Optional 6-digit code for easy access
  canViewSpeeches: boolean("can_view_speeches").default(true),
  canViewSchedule: boolean("can_view_schedule").default(true),
  canEditSpeeches: boolean("can_edit_speeches").default(false),
  // Edit permission for speeches
  canEditSchedule: boolean("can_edit_schedule").default(false),
  // Edit permission for schedule
  status: text("status").notNull().default("active"),
  // active, revoked, expired
  expiresAt: timestamp("expires_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCoordinatorInvitationSchema = createInsertSchema(coordinatorInvitations).omit({
  id: true,
  accessToken: true,
  accessCode: true,
  status: true,
  lastAccessedAt: true,
  createdAt: true,
  updatedAt: true
});
var createCoordinatorInvitationSchema = z.object({
  name: z.string().min(1, "Navn er p\xE5krevd"),
  email: z.string().email().optional().or(z.literal("")),
  roleLabel: z.string().default("Toastmaster"),
  canViewSpeeches: z.boolean().default(true),
  canViewSchedule: z.boolean().default(true),
  canEditSpeeches: z.boolean().default(false),
  canEditSchedule: z.boolean().default(false),
  expiresAt: z.string().optional()
});
var guestInvitations = pgTable("guest_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  template: text("template").notNull().default("classic"),
  // classic, floral, modern
  message: text("message"),
  inviteToken: text("invite_token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  // pending, sent, responded, declined
  responseAttending: boolean("response_attending"),
  responseDietary: text("response_dietary"),
  responseAllergies: text("response_allergies"),
  responseNotes: text("response_notes"),
  responsePlusOne: text("response_plus_one"),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertGuestInvitationSchema = createInsertSchema(guestInvitations).omit({
  id: true,
  inviteToken: true,
  status: true,
  responseAttending: true,
  responseDietary: true,
  responseAllergies: true,
  responseNotes: true,
  responsePlusOne: true,
  respondedAt: true,
  createdAt: true,
  updatedAt: true
});
var createGuestInvitationSchema = z.object({
  name: z.string().min(1, "Navn er p\xE5krevd"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  template: z.enum(["classic", "floral", "modern"]).default("classic"),
  message: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional()
});
var coupleVendorContracts = pgTable("couple_vendor_contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  offerId: varchar("offer_id").references(() => vendorOffers.id, { onDelete: "set null" }),
  // Link to accepted offer
  status: text("status").notNull().default("active"),
  // active, completed, cancelled
  vendorRole: text("vendor_role"),
  // "photographer", "videographer", "caterer", etc.
  notifyOnScheduleChanges: boolean("notify_on_schedule_changes").default(true),
  notifyOnSpeechChanges: boolean("notify_on_speech_changes").default(true),
  canViewSchedule: boolean("can_view_schedule").default(true),
  canViewSpeeches: boolean("can_view_speeches").default(false),
  canViewTableSeating: boolean("can_view_table_seating").default(false),
  notifyOnTableChanges: boolean("notify_on_table_changes").default(false),
  completedAt: timestamp("completed_at"),
  reviewReminderSentAt: timestamp("review_reminder_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCoupleVendorContractSchema = createInsertSchema(coupleVendorContracts).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
});
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientType: text("recipient_type").notNull(),
  // "couple", "vendor", "coordinator"
  recipientId: varchar("recipient_id").notNull(),
  // coupleId, vendorId, or coordinatorInvitationId
  type: text("type").notNull(),
  // "schedule_changed", "speech_changed", "vendor_update", "offer_accepted", etc.
  title: text("title").notNull(),
  body: text("body"),
  payload: text("payload"),
  // JSON string with additional data
  relatedEntityType: text("related_entity_type"),
  // "schedule_event", "speech", "offer", etc.
  relatedEntityId: varchar("related_entity_id"),
  actorType: text("actor_type"),
  // "couple", "vendor", "coordinator"
  actorId: varchar("actor_id"),
  actorName: text("actor_name"),
  readAt: timestamp("read_at"),
  sentVia: text("sent_via").default("in_app"),
  // "in_app", "push", "email"
  createdAt: timestamp("created_at").defaultNow()
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  readAt: true,
  createdAt: true
});
var activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  actorType: text("actor_type").notNull(),
  // "couple", "coordinator"
  actorId: varchar("actor_id").notNull(),
  // coupleId or coordinatorInvitationId
  actorName: text("actor_name"),
  action: text("action").notNull(),
  // "created", "updated", "deleted"
  entityType: text("entity_type").notNull(),
  // "schedule_event", "speech"
  entityId: varchar("entity_id").notNull(),
  previousValue: text("previous_value"),
  // JSON snapshot
  newValue: text("new_value"),
  // JSON snapshot
  createdAt: timestamp("created_at").defaultNow()
});
var weddingGuests = pgTable("wedding_guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  category: text("category"),
  // "family", "friends", "colleagues", "reserved", "other"
  status: text("status").notNull().default("pending"),
  // "pending", "confirmed", "declined"
  dietaryRequirements: text("dietary_requirements"),
  allergies: text("allergies"),
  notes: text("notes"),
  plusOne: boolean("plus_one").notNull().default(false),
  plusOneName: text("plus_one_name"),
  tableNumber: integer("table_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertWeddingGuestSchema = createInsertSchema(weddingGuests).omit({
  id: true,
  coupleId: true,
  createdAt: true,
  updatedAt: true
});
var updateWeddingGuestSchema = insertWeddingGuestSchema.partial();
var weddingTables = pgTable("wedding_tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  tableNumber: integer("table_number").notNull(),
  name: text("name").notNull(),
  // "Bord 1", "Hovedbord", etc.
  category: text("category"),
  // "bride_family", "groom_family", "friends", "colleagues", "reserved", "main"
  label: text("label"),
  // Custom label like "Brudens familie", "Brudgommens venner", etc.
  seats: integer("seats").notNull().default(8),
  isReserved: boolean("is_reserved").notNull().default(false),
  notes: text("notes"),
  // Private notes for couple
  vendorNotes: text("vendor_notes"),
  // Notes visible to venue/decorators
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertWeddingTableSchema = createInsertSchema(weddingTables).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var tableGuestAssignments = pgTable("table_guest_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  tableId: varchar("table_id").notNull().references(() => weddingTables.id, { onDelete: "cascade" }),
  guestId: varchar("guest_id").notNull().references(() => weddingGuests.id, { onDelete: "cascade" }),
  seatNumber: integer("seat_number"),
  createdAt: timestamp("created_at").defaultNow()
});
var tableSeatingInvitations = pgTable("table_seating_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  recipientName: text("recipient_name").notNull(),
  // "Lokalet AS", "Dekoratør Hansen"
  recipientType: text("recipient_type").notNull(),
  // "venue", "decorator", "planner", "other"
  email: text("email"),
  phone: text("phone"),
  accessToken: text("access_token").notNull().unique(),
  accessCode: text("access_code").notNull(),
  // 6-digit code for easy entry
  canSeeGuestNames: boolean("can_see_guest_names").notNull().default(true),
  canSeeNotes: boolean("can_see_notes").notNull().default(false),
  // Whether they can see vendor_notes
  expiresAt: timestamp("expires_at"),
  status: text("status").notNull().default("active"),
  // "active", "revoked"
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertTableSeatingInvitationSchema = createInsertSchema(tableSeatingInvitations).omit({
  id: true,
  accessToken: true,
  accessCode: true,
  status: true,
  lastAccessedAt: true,
  createdAt: true,
  updatedAt: true
});
var appFeedback = pgTable("app_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submitterType: text("submitter_type").notNull(),
  // "couple", "vendor"
  submitterId: varchar("submitter_id").notNull(),
  // coupleId or vendorId
  category: text("category").notNull(),
  // "bug", "feature_request", "general", "complaint"
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  // "pending", "reviewed", "resolved", "closed"
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertAppFeedbackSchema = createInsertSchema(appFeedback).omit({
  id: true,
  status: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true
});
var vendorReviews = pgTable("vendor_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => coupleVendorContracts.id, { onDelete: "cascade" }),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  // 1-5 stars
  title: text("title"),
  body: text("body"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false),
  // Admin moderation
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
  // Admin ID
  editableUntil: timestamp("editable_until"),
  // Can edit within 14 days
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertVendorReviewSchema = createInsertSchema(vendorReviews).omit({
  id: true,
  isApproved: true,
  approvedAt: true,
  approvedBy: true,
  editableUntil: true,
  createdAt: true,
  updatedAt: true
});
var vendorReviewResponses = pgTable("vendor_review_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull().references(() => vendorReviews.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertVendorReviewResponseSchema = createInsertSchema(vendorReviewResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var faqItems = pgTable("faq_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  // 'couple' or 'vendor'
  icon: text("icon").notNull(),
  // Feather icon name
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertFaqItemSchema = createInsertSchema(faqItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateFaqItemSchema = z.object({
  category: z.enum(["couple", "vendor"]).optional(),
  icon: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional()
});
var videoGuides = pgTable("video_guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnail: text("thumbnail"),
  duration: text("duration"),
  // HH:mm:ss format
  category: text("category").notNull().default("vendor"),
  // vendor or couple
  icon: text("icon").notNull().default("video"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertVideoGuideSchema = createInsertSchema(videoGuides).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  category: z.enum(["vendor", "couple"]).default("vendor")
});
var updateVideoGuideSchema = z.object({
  title: z.string().min(1, "Tittel er p\xE5krevd"),
  description: z.string().min(1, "Beskrivelse er p\xE5krevd"),
  videoUrl: z.string().url("Gyldig video-URL er p\xE5krevd"),
  thumbnail: z.string().optional(),
  duration: z.string().optional(),
  category: z.enum(["vendor", "couple"]).default("vendor"),
  icon: z.string().default("video"),
  sortOrder: z.number().int(),
  isActive: z.boolean()
});
var subscriptionTiers = pgTable("subscription_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  // "Starter", "Professional", "Enterprise"
  displayName: text("display_name").notNull(),
  description: text("description"),
  priceNok: integer("price_nok").notNull(),
  // Price in NOK per month
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  // Feature limits per tier
  maxInspirationPhotos: integer("max_inspiration_photos").notNull().default(10),
  // -1 = unlimited
  maxMonthlyVideoMinutes: integer("max_monthly_video_minutes").notNull().default(0),
  maxStorageGb: integer("max_storage_gb").notNull().default(5),
  // Features
  hasAdvancedAnalytics: boolean("has_advanced_analytics").notNull().default(false),
  hasPrioritizedSearch: boolean("has_prioritized_search").notNull().default(false),
  hasCustomLandingPage: boolean("has_custom_landing_page").notNull().default(false),
  hasApiAccess: boolean("has_api_access").notNull().default(false),
  hasVippsPaymentLink: boolean("has_vipps_payment_link").notNull().default(false),
  hasCustomBranding: boolean("has_custom_branding").notNull().default(false),
  // Pricing adjustments
  commissionPercentage: integer("commission_percentage").notNull().default(3),
  // 3% = 300 basis points
  stripeFeePercentage: integer("stripe_fee_percentage").notNull().default(0),
  // Extra fee if any
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var vendorSubscriptions = pgTable("vendor_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  tierId: varchar("tier_id").notNull().references(() => subscriptionTiers.id),
  // Stripe subscription info
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  // Status
  status: text("status").notNull().default("active"),
  // active, cancelled, past_due, paused
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  pausedUntil: timestamp("paused_until"),
  // Auto-renewal
  autoRenew: boolean("auto_renew").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var vendorUsageMetrics = pgTable("vendor_usage_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  // 1-12
  // Usage counts
  inspirationPhotosUploaded: integer("inspiration_photos_uploaded").notNull().default(0),
  videoMinutesUsed: integer("video_minutes_used").notNull().default(0),
  storageUsedGb: integer("storage_used_gb").notNull().default(0),
  profileViewsCount: integer("profile_views_count").notNull().default(0),
  messagesSent: integer("messages_sent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var vendorPayments = pgTable("vendor_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id").references(() => vendorSubscriptions.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  amountNok: integer("amount_nok").notNull(),
  // Amount in øre (cents)
  currency: text("currency").notNull().default("NOK"),
  status: text("status").notNull().default("pending"),
  // pending, succeeded, failed, refunded
  description: text("description"),
  billingPeriodStart: timestamp("billing_period_start"),
  billingPeriodEnd: timestamp("billing_period_end"),
  paidAt: timestamp("paid_at"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateSubscriptionTierSchema = z.object({
  name: z.string().optional(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  priceNok: z.number().int().positive().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  maxInspirationPhotos: z.number().int().optional(),
  maxMonthlyVideoMinutes: z.number().int().optional(),
  maxStorageGb: z.number().int().optional(),
  hasAdvancedAnalytics: z.boolean().optional(),
  hasPrioritizedSearch: z.boolean().optional(),
  hasCustomLandingPage: z.boolean().optional(),
  hasApiAccess: z.boolean().optional(),
  hasVippsPaymentLink: z.boolean().optional(),
  hasCustomBranding: z.boolean().optional(),
  commissionPercentage: z.number().int().optional(),
  stripeFeePercentage: z.number().int().optional()
});
var insertVendorSubscriptionSchema = createInsertSchema(vendorSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertVendorUsageSchema = createInsertSchema(vendorUsageMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertVendorPaymentSchema = createInsertSchema(vendorPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
config({ path: ".env.local", override: true });
var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// server/routes.ts
import bcrypt from "bcryptjs";

// server/subscription-routes.ts
import { eq, and, sql as sql2 } from "drizzle-orm";

// server/vipps-service.ts
import crypto from "crypto";
var VIPPS_CONFIG = {
  clientId: process.env.VIPPS_CLIENT_ID || "",
  clientSecret: process.env.VIPPS_CLIENT_SECRET || "",
  merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER || "123456",
  // Test environment
  apiUrl: "https://apitest.vipps.no",
  tokenUrl: "https://apitest.vipps.no/accesstoken/get",
  callbackUrl: process.env.VIPPS_CALLBACK_URL || "https://wedflow.no/api/vipps/callback",
  redirectUrl: process.env.VIPPS_REDIRECT_URL || "https://wedflow.no/payment-success"
};
var cachedAccessToken = null;
async function getVIPPSAccessToken() {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }
  try {
    const response = await fetch(VIPPS_CONFIG.tokenUrl, {
      method: "POST",
      headers: {
        "client_id": VIPPS_CONFIG.clientId,
        "client_secret": VIPPS_CONFIG.clientSecret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    if (!response.ok) {
      throw new Error(`VIPPS token error: ${response.status}`);
    }
    const data = await response.json();
    const expiresAt = Date.now() + (data.expires_in * 1e3 - 1e4);
    cachedAccessToken = { token: data.access_token, expiresAt };
    return data.access_token;
  } catch (error) {
    console.error("Error getting VIPPS access token:", error);
    throw error;
  }
}
async function initiateVIPPSPayment(payment) {
  const accessToken = await getVIPPSAccessToken();
  const payload = {
    customerInfo: {
      mobileNumber: "4712345678"
      // Will be prompted to user
    },
    merchantInfo: {
      orderId: payment.orderId,
      callbackPrefix: VIPPS_CONFIG.callbackUrl,
      callbackAuthToken: generateAuthToken(),
      isApp: false,
      merchantWebsiteUrl: "https://wedflow.no",
      termsUrl: "https://wedflow.no/terms",
      staticShippingDetails: {
        isShippingRequired: false
      }
    },
    transaction: {
      amount: payment.amount,
      // in øre
      orderId: payment.orderId,
      transactionText: payment.description,
      paymentText: `Wedflow subscription - ${payment.description}`,
      refOrderId: payment.subscriptionTierId
    }
  };
  try {
    const response = await fetch(`${VIPPS_CONFIG.apiUrl}/ecomm/v2/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Request-Id": crypto.randomUUID(),
        "Merchant-Serial-Number": VIPPS_CONFIG.merchantSerialNumber
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("VIPPS payment initiation error:", error);
      throw new Error(`VIPPS error: ${error.message || response.status}`);
    }
    const data = await response.json();
    return {
      paymentUrl: data.url,
      vippsOrderId: payment.orderId
    };
  } catch (error) {
    console.error("Error initiating VIPPS payment:", error);
    throw error;
  }
}
async function getVIPPSPaymentStatus(orderId) {
  const accessToken = await getVIPPSAccessToken();
  try {
    const response = await fetch(
      `${VIPPS_CONFIG.apiUrl}/ecomm/v2/payments/${orderId}/status`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "X-Request-Id": crypto.randomUUID(),
          "Merchant-Serial-Number": VIPPS_CONFIG.merchantSerialNumber
        }
      }
    );
    if (!response.ok) {
      throw new Error(`VIPPS status error: ${response.status}`);
    }
    const data = await response.json();
    return {
      orderId: data.orderId,
      transactionStatus: data.transactionLogHistory?.[0]?.transactionStatus || "UNKNOWN",
      amount: data.amount
    };
  } catch (error) {
    console.error("Error getting VIPPS payment status:", error);
    throw error;
  }
}
async function captureVIPPSPayment(orderId, amount) {
  const accessToken = await getVIPPSAccessToken();
  try {
    const response = await fetch(
      `${VIPPS_CONFIG.apiUrl}/ecomm/v2/payments/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Request-Id": crypto.randomUUID(),
          "Merchant-Serial-Number": VIPPS_CONFIG.merchantSerialNumber
        },
        body: JSON.stringify({ amount })
      }
    );
    if (!response.ok) {
      throw new Error(`VIPPS capture error: ${response.status}`);
    }
    const data = await response.json();
    return {
      transactionId: data.transactionId || orderId,
      status: "captured"
    };
  } catch (error) {
    console.error("Error capturing VIPPS payment:", error);
    throw error;
  }
}
async function refundVIPPSPayment(orderId, amount) {
  const accessToken = await getVIPPSAccessToken();
  try {
    const response = await fetch(
      `${VIPPS_CONFIG.apiUrl}/ecomm/v2/payments/${orderId}/refund`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Request-Id": crypto.randomUUID(),
          "Merchant-Serial-Number": VIPPS_CONFIG.merchantSerialNumber
        },
        body: JSON.stringify({ amount })
      }
    );
    if (!response.ok) {
      throw new Error(`VIPPS refund error: ${response.status}`);
    }
    return { status: "refunded" };
  } catch (error) {
    console.error("Error refunding VIPPS payment:", error);
    throw error;
  }
}
function verifyVIPPSWebhookSignature(signature, body, authToken) {
  const hash = crypto.createHmac("sha256", authToken).update(body).digest("base64");
  return hash === signature;
}
function generateAuthToken() {
  return crypto.randomBytes(32).toString("hex");
}

// server/subscription-routes.ts
async function checkVendorAuth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Ikke autorisert" });
    return null;
  }
  const token = authHeader.replace("Bearer ", "");
  const [vendorSession] = await db.select({ vendorId: vendorSessions.vendorId }).from(vendorSessions).where(and(
    eq(vendorSessions.token, token),
    sql2`${vendorSessions.expiresAt} > NOW()`
  ));
  if (!vendorSession) {
    res.status(401).json({ error: "\xD8kt utl\xF8pt. Vennligst logg inn p\xE5 nytt." });
    return null;
  }
  const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorSession.vendorId));
  if (!vendor || vendor.status !== "approved") {
    res.status(401).json({ error: "Ikke autorisert" });
    return null;
  }
  return vendorSession.vendorId;
}
async function getVendorSubscription(vendorId) {
  const [subscription] = await db.select().from(vendorSubscriptions).where(
    and(
      eq(vendorSubscriptions.vendorId, vendorId),
      eq(vendorSubscriptions.status, "active")
    )
  );
  return subscription;
}
async function getTierDetails(tierId) {
  const [tier] = await db.select().from(subscriptionTiers).where(eq(subscriptionTiers.id, tierId));
  return tier;
}
async function getCurrentMonthUsage(vendorId) {
  const now = /* @__PURE__ */ new Date();
  const [usage] = await db.select().from(vendorUsageMetrics).where(
    and(
      eq(vendorUsageMetrics.vendorId, vendorId),
      eq(vendorUsageMetrics.year, now.getFullYear()),
      eq(vendorUsageMetrics.month, now.getMonth() + 1)
    )
  );
  if (!usage) {
    const [newUsage] = await db.insert(vendorUsageMetrics).values({
      vendorId,
      year: now.getFullYear(),
      month: now.getMonth() + 1
    }).returning();
    return newUsage;
  }
  return usage;
}
function registerSubscriptionRoutes(app2) {
  app2.get("/api/vendor/subscription/tiers", async (req, res) => {
    try {
      const tiers = await db.select().from(subscriptionTiers).where(eq(subscriptionTiers.isActive, true)).orderBy(subscriptionTiers.sortOrder);
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching subscription tiers:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnementsalternativer" });
    }
  });
  app2.get("/api/vendor/subscription/current", async (req, res) => {
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
        usage
      });
    } catch (error) {
      console.error("Error fetching current subscription:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnement" });
    }
  });
  app2.post("/api/vendor/subscription/check-feature", async (req, res) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    try {
      const { feature } = req.body;
      const subscription = await getVendorSubscription(vendorId);
      if (!subscription) {
        return res.json({ hasAccess: false, reason: "Ingen aktiv abonnement" });
      }
      const tier = await getTierDetails(subscription.tierId);
      if (!tier) {
        return res.json({ hasAccess: false, reason: "Tier ikke funnet" });
      }
      const featureAccess = {
        advanced_analytics: tier.hasAdvancedAnalytics,
        prioritized_search: tier.hasPrioritizedSearch,
        custom_landing_page: tier.hasCustomLandingPage,
        api_access: tier.hasApiAccess,
        vipps_payment_link: tier.hasVippsPaymentLink,
        custom_branding: tier.hasCustomBranding
      };
      const hasAccess = featureAccess[feature] ?? false;
      res.json({ hasAccess, feature, tier: tier.name });
    } catch (error) {
      console.error("Error checking feature access:", error);
      res.status(500).json({ error: "Kunne ikke sjekke feature-tilgang" });
    }
  });
  app2.get("/api/vendor/subscription/usage-limits", async (req, res) => {
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
        maxMonthlyVideoMinutes: tier?.maxMonthlyVideoMinutes ?? 0,
        maxStorageGb: tier?.maxStorageGb ?? 5
      };
      const usage_data = {
        inspirationPhotosUploaded: usage?.inspirationPhotosUploaded ?? 0,
        videoMinutesUsed: usage?.videoMinutesUsed ?? 0,
        storageUsedGb: usage?.storageUsedGb ?? 0,
        profileViewsCount: usage?.profileViewsCount ?? 0,
        messagesSent: usage?.messagesSent ?? 0
      };
      const available = {
        inspirationPhotos: Math.max(
          0,
          (limits.maxInspirationPhotos === -1 ? 999999 : limits.maxInspirationPhotos) - (usage_data.inspirationPhotosUploaded ?? 0)
        ),
        videoMinutes: Math.max(
          0,
          limits.maxMonthlyVideoMinutes - (usage_data.videoMinutesUsed ?? 0)
        ),
        storageGb: Math.max(
          0,
          limits.maxStorageGb - (usage_data.storageUsedGb ?? 0)
        )
      };
      res.json({ limits, usage: usage_data, available });
    } catch (error) {
      console.error("Error fetching usage limits:", error);
      res.status(500).json({ error: "Kunne ikke hente bruksgrenser" });
    }
  });
  app2.post("/api/vendor/subscription/track-usage", async (req, res) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    try {
      const { metric, amount = 1 } = req.body;
      const usage = await getCurrentMonthUsage(vendorId);
      if (!usage) {
        return res.status(500).json({ error: "Kunne ikke f\xE5 bruksdata" });
      }
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
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
      const [updated] = await db.update(vendorUsageMetrics).set(updateData).where(eq(vendorUsageMetrics.id, usage.id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error tracking usage:", error);
      res.status(500).json({ error: "Kunne ikke registrere bruk" });
    }
  });
  app2.get("/api/admin/subscription/tiers", async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const tiers = await db.select().from(subscriptionTiers).orderBy(subscriptionTiers.sortOrder);
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching tiers:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnementer" });
    }
  });
  app2.post("/api/admin/subscription/tiers", async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const [tier] = await db.insert(subscriptionTiers).values(req.body).returning();
      res.status(201).json(tier);
    } catch (error) {
      console.error("Error creating tier:", error);
      res.status(400).json({ error: error.message || "Kunne ikke opprette abonnement" });
    }
  });
  app2.patch("/api/admin/subscription/tiers/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { id } = req.params;
      const [tier] = await db.update(subscriptionTiers).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq(subscriptionTiers.id, id)).returning();
      if (!tier) {
        return res.status(404).json({ error: "Abonnement ikke funnet" });
      }
      res.json(tier);
    } catch (error) {
      console.error("Error updating tier:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere abonnement" });
    }
  });
  app2.get("/api/admin/subscription/vendors", async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const subs = await db.select({
        subscription: vendorSubscriptions,
        vendor: vendors,
        tier: subscriptionTiers
      }).from(vendorSubscriptions).innerJoin(vendors, eq(vendorSubscriptions.vendorId, vendors.id)).innerJoin(subscriptionTiers, eq(vendorSubscriptions.tierId, subscriptionTiers.id));
      res.json(subs);
    } catch (error) {
      console.error("Error fetching vendor subscriptions:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnementer" });
    }
  });
  app2.get("/api/admin/subscription/usage/:vendorId", async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { vendorId } = req.params;
      const usage = await db.select().from(vendorUsageMetrics).where(eq(vendorUsageMetrics.vendorId, vendorId));
      res.json(usage);
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ error: "Kunne ikke hente bruksdata" });
    }
  });
  app2.get("/api/admin/subscription/payments/:vendorId", async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { vendorId } = req.params;
      const payments = await db.select().from(vendorPayments).where(eq(vendorPayments.vendorId, vendorId));
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Kunne ikke hente betalinger" });
    }
  });
  app2.post("/api/vendor/subscription/checkout", async (req, res) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    try {
      const { tierId } = req.body;
      const tier = await getTierDetails(tierId);
      if (!tier) {
        return res.status(404).json({ error: "Tier ikke funnet" });
      }
      const orderId = `WF-${vendorId.substring(0, 8)}-${Date.now()}`;
      const now = /* @__PURE__ */ new Date();
      const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const [payment] = await db.insert(vendorPayments).values({
        vendorId,
        amountNok: tier.priceNok * 100,
        // Convert to øre
        currency: "NOK",
        status: "pending",
        description: `${tier.displayName} subscription (monthly)`,
        billingPeriodStart: now,
        billingPeriodEnd: nextBillingDate
      }).returning();
      const vippsPayment = await initiateVIPPSPayment({
        orderId,
        amount: tier.priceNok * 100,
        // in øre
        description: `${tier.displayName} subscription`,
        vendorId,
        subscriptionTierId: tierId,
        billingPeriodStart: now,
        billingPeriodEnd: nextBillingDate
      });
      await db.update(vendorPayments).set({
        stripePaymentIntentId: orderId,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(vendorPayments.id, payment.id));
      res.json({
        paymentId: payment.id,
        paymentUrl: vippsPayment.paymentUrl,
        amount: tier.priceNok,
        tierName: tier.displayName
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      res.status(500).json({ error: "Kunne ikke initialisere betaling" });
    }
  });
  app2.get("/api/vendor/subscription/payment-status/:orderId", async (req, res) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    try {
      const { orderId } = req.params;
      const [payment] = await db.select().from(vendorPayments).where(and(
        eq(vendorPayments.vendorId, vendorId),
        eq(vendorPayments.stripePaymentIntentId, orderId)
      ));
      if (!payment) {
        return res.status(404).json({ error: "Betaling ikke funnet" });
      }
      const vippsStatus = await getVIPPSPaymentStatus(orderId);
      if (vippsStatus.transactionStatus === "CAPTURED" && payment.status !== "succeeded") {
        await db.update(vendorPayments).set({
          status: "succeeded",
          paidAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(vendorPayments.id, payment.id));
      } else if (vippsStatus.transactionStatus === "RESERVED" && payment.status === "pending") {
      }
      res.json({
        status: payment.status,
        amount: payment.amountNok,
        vippsStatus: vippsStatus.transactionStatus,
        paidAt: payment.paidAt
      });
    } catch (error) {
      console.error("Error checking payment status:", error);
      res.status(500).json({ error: "Kunne ikke hente betalingsstatus" });
    }
  });
  app2.post("/api/vipps/callback", async (req, res) => {
    try {
      const { orderId, transactionInfo } = req.body;
      const signature = req.headers["x-vipps-signature"];
      const authToken = process.env.VIPPS_AUTH_TOKEN || "";
      const bodyString = JSON.stringify(req.body);
      if (!verifyVIPPSWebhookSignature(signature, bodyString, authToken)) {
        return res.status(401).json({ error: "Invalid signature" });
      }
      const [payment] = await db.select().from(vendorPayments).where(eq(vendorPayments.stripePaymentIntentId, orderId));
      if (!payment) {
        console.warn(`Payment not found for order: ${orderId}`);
        return res.status(404).json({ error: "Payment not found" });
      }
      const status = transactionInfo?.status || "UNKNOWN";
      if (status === "CAPTURED" || status === "RESERVED") {
        await db.update(vendorPayments).set({
          status: "succeeded",
          paidAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(vendorPayments.id, payment.id));
        console.log(`Payment ${orderId} captured successfully`);
      } else if (status === "FAILED" || status === "ABORTED") {
        await db.update(vendorPayments).set({
          status: "failed",
          failureReason: transactionInfo?.errorMessage || "Payment failed",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(vendorPayments.id, payment.id));
        console.log(`Payment ${orderId} failed: ${transactionInfo?.errorMessage}`);
      }
      res.json({ success: true, orderId });
    } catch (error) {
      console.error("Error processing VIPPS callback:", error);
      res.status(500).json({ error: "Callback processing failed" });
    }
  });
  app2.post("/api/admin/subscription/payments/:orderId/capture", async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { orderId } = req.params;
      const { amount } = req.body;
      await captureVIPPSPayment(orderId, amount * 100);
      await db.update(vendorPayments).set({
        status: "succeeded",
        paidAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(vendorPayments.stripePaymentIntentId, orderId));
      res.json({ success: true, message: "Payment captured" });
    } catch (error) {
      console.error("Error capturing payment:", error);
      res.status(500).json({ error: "Kunne ikke hente betaling" });
    }
  });
  app2.post("/api/admin/subscription/payments/:orderId/refund", async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { orderId } = req.params;
      const { amount } = req.body;
      await refundVIPPSPayment(orderId, amount * 100);
      await db.update(vendorPayments).set({
        status: "refunded",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(vendorPayments.stripePaymentIntentId, orderId));
      res.json({ success: true, message: "Payment refunded" });
    } catch (error) {
      console.error("Error refunding payment:", error);
      res.status(500).json({ error: "Kunne ikke refundere betaling" });
    }
  });
}

// server/routes.ts
import { eq as eq2, and as and2, desc, sql as sql3, inArray } from "drizzle-orm";
function generateAccessCode() {
  return crypto2.randomBytes(8).toString("hex").toUpperCase();
}
function generateSessionToken() {
  return crypto2.randomBytes(32).toString("hex");
}
var VENDOR_SESSIONS = /* @__PURE__ */ new Map();
var SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1e3;
var COUPLE_SESSIONS = /* @__PURE__ */ new Map();
function cleanExpiredSessions() {
  const now = /* @__PURE__ */ new Date();
  for (const [token, session] of VENDOR_SESSIONS.entries()) {
    if (session.expiresAt < now) {
      VENDOR_SESSIONS.delete(token);
    }
  }
}
setInterval(cleanExpiredSessions, 60 * 60 * 1e3);
var YR_CACHE = /* @__PURE__ */ new Map();
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
var DEFAULT_CATEGORIES = [
  { name: "Fotograf", icon: "camera", description: "Bryllupsfotografer" },
  { name: "Videograf", icon: "video", description: "Bryllupsvideofilmer" },
  { name: "Blomster", icon: "flower", description: "Blomsterdekorat\xF8rer" },
  { name: "Catering", icon: "utensils", description: "Mat og drikke" },
  { name: "Musikk", icon: "music", description: "Band, DJ og musikere" },
  { name: "Venue", icon: "home", description: "Bryllupslokaler" },
  { name: "Kake", icon: "cake", description: "Bryllupskaker" },
  { name: "Planlegger", icon: "clipboard", description: "Bryllupsplanleggere" },
  { name: "H\xE5r & Makeup", icon: "scissors", description: "Styling og sminke" },
  { name: "Transport", icon: "car", description: "Bryllupstransport" }
];
var DEFAULT_INSPIRATION_CATEGORIES = [
  { name: "Brudekjoler", icon: "heart", sortOrder: 1 },
  { name: "Blomsterarrangementer", icon: "flower", sortOrder: 2 },
  { name: "Dekorasjon", icon: "star", sortOrder: 3 },
  { name: "Bryllupskaker", icon: "cake", sortOrder: 4 },
  { name: "Lokaler", icon: "home", sortOrder: 5 },
  { name: "Borddekning", icon: "utensils", sortOrder: 6 },
  { name: "Brudebukett", icon: "gift", sortOrder: 7 },
  { name: "H\xE5rfrisyrer", icon: "scissors", sortOrder: 8 },
  { name: "Bryllupsbilder", icon: "camera", sortOrder: 9 },
  { name: "Invitasjoner", icon: "mail", sortOrder: 10 }
];
async function fetchYrWeather(lat, lon) {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = YR_CACHE.get(cacheKey);
  if (cached && cached.expires > /* @__PURE__ */ new Date()) {
    return cached.data;
  }
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Wedflow/1.0 https://replit.com"
    }
  });
  if (!response.ok) {
    throw new Error(`YR API error: ${response.status}`);
  }
  const data = await response.json();
  const expiresHeader = response.headers.get("Expires");
  const expires = expiresHeader ? new Date(expiresHeader) : new Date(Date.now() + 36e5);
  YR_CACHE.set(cacheKey, { data, expires });
  return data;
}
async function registerRoutes(app2) {
  const adminConvClients = /* @__PURE__ */ new Map();
  const adminListClients = /* @__PURE__ */ new Set();
  const conversationClients = /* @__PURE__ */ new Map();
  const vendorListClients = /* @__PURE__ */ new Map();
  const coupleListClients = /* @__PURE__ */ new Map();
  async function checkVendorToken(token) {
    const [vendorSession] = await db.select({ vendorId: vendorSessions.vendorId }).from(vendorSessions).where(and2(eq2(vendorSessions.token, token), sql3`${vendorSessions.expiresAt} > NOW()`));
    if (!vendorSession) return null;
    const [vendor] = await db.select().from(vendors).where(eq2(vendors.id, vendorSession.vendorId));
    if (!vendor || vendor.status !== "approved") return null;
    return vendorSession.vendorId;
  }
  async function getOrCreateAdminConversationId(vendorId) {
    const existing = await db.select().from(adminConversations).where(eq2(adminConversations.vendorId, vendorId));
    if (existing[0]) return existing[0].id;
    const [created] = await db.insert(adminConversations).values({ vendorId }).returning();
    return created.id;
  }
  function broadcastAdminConv(conversationId, data) {
    const set = adminConvClients.get(conversationId);
    if (!set) return;
    const payload = JSON.stringify(data);
    for (const ws of Array.from(set)) {
      try {
        if (ws.readyState === 1) ws.send(payload);
        else set.delete(ws);
      } catch {
        set.delete(ws);
      }
    }
  }
  function broadcastAdminList(data) {
    const payload = JSON.stringify(data);
    for (const ws of Array.from(adminListClients)) {
      try {
        if (ws.readyState === 1) ws.send(payload);
        else adminListClients.delete(ws);
      } catch {
        adminListClients.delete(ws);
      }
    }
  }
  async function checkCoupleToken(token) {
    const [sess] = await db.select({ coupleId: coupleSessions.coupleId }).from(coupleSessions).where(and2(eq2(coupleSessions.token, token), sql3`${coupleSessions.expiresAt} > NOW()`));
    if (!sess) return null;
    const [couple] = await db.select().from(coupleProfiles).where(eq2(coupleProfiles.id, sess.coupleId));
    if (!couple) return null;
    return sess.coupleId;
  }
  function broadcastConversation(conversationId, data) {
    const set = conversationClients.get(conversationId);
    if (!set) return;
    const payload = JSON.stringify(data);
    for (const ws of Array.from(set)) {
      try {
        if (ws.readyState === 1) ws.send(payload);
        else set.delete(ws);
      } catch {
        set.delete(ws);
      }
    }
  }
  function broadcastVendorList(vendorId, data) {
    const set = vendorListClients.get(vendorId);
    if (!set) return;
    const payload = JSON.stringify(data);
    for (const ws of Array.from(set)) {
      try {
        if (ws.readyState === 1) ws.send(payload);
        else set.delete(ws);
      } catch {
        set.delete(ws);
      }
    }
  }
  function broadcastCoupleList(coupleId, data) {
    const set = coupleListClients.get(coupleId);
    if (!set) return;
    const payload = JSON.stringify(data);
    for (const ws of Array.from(set)) {
      try {
        if (ws.readyState === 1) ws.send(payload);
        else set.delete(ws);
      } catch {
        set.delete(ws);
      }
    }
  }
  app2.get("/api/weather", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat);
      const lon = parseFloat(req.query.lon);
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
          precipitation: now.data?.next_1_hours?.details?.precipitation_amount || 0
        } : null,
        hourly: next6Hours.map((t) => ({
          time: t.time,
          temperature: t.data?.instant?.details?.air_temperature,
          symbol: t.data?.next_1_hours?.summary?.symbol_code || t.data?.next_6_hours?.summary?.symbol_code,
          precipitation: t.data?.next_1_hours?.details?.precipitation_amount || 0
        })),
        daily: next24Hours.filter((_, i) => i % 6 === 0).map((t) => ({
          time: t.time,
          temperature: t.data?.instant?.details?.air_temperature,
          symbol: t.data?.next_6_hours?.summary?.symbol_code,
          precipitationMax: t.data?.next_6_hours?.details?.precipitation_amount || 0
        }))
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
  app2.get("/api/brreg/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string" || q.length < 2) {
        return res.json({ entities: [] });
      }
      const brregUrl = `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(q)}&size=10`;
      const response = await fetch(brregUrl, {
        headers: {
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        console.error("Brreg API error:", response.status);
        return res.json({ entities: [] });
      }
      const data = await response.json();
      const entities = data._embedded?.enheter || [];
      const formattedEntities = entities.map((entity) => ({
        organizationNumber: entity.organisasjonsnummer,
        name: entity.navn,
        organizationForm: entity.organisasjonsform?.beskrivelse,
        address: entity.forretningsadresse ? {
          street: entity.forretningsadresse.adresse?.join(", "),
          postalCode: entity.forretningsadresse.postnummer,
          city: entity.forretningsadresse.poststed,
          municipality: entity.forretningsadresse.kommune
        } : null
      }));
      res.json({ entities: formattedEntities });
    } catch (error) {
      console.error("Error searching brreg:", error);
      res.json({ entities: [] });
    }
  });
  app2.get("/api/vendor-categories", async (_req, res) => {
    try {
      const categories = await db.select().from(vendorCategories);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });
  app2.post("/api/vendors/register", async (req, res) => {
    try {
      const validation = vendorRegistrationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Ugyldig data",
          details: validation.error.errors
        });
      }
      const { email, password, ...profileData } = validation.data;
      const existingVendor = await db.select().from(vendors).where(eq2(vendors.email, email));
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
        priceRange: profileData.priceRange || null
      }).returning();
      const { password: _, ...vendorWithoutPassword } = newVendor;
      res.status(201).json({
        message: "Registrering vellykket! Din s\xF8knad er under behandling.",
        vendor: vendorWithoutPassword
      });
    } catch (error) {
      console.error("Error registering vendor:", error);
      res.status(500).json({ error: "Kunne ikke registrere leverand\xF8r" });
    }
  });
  app2.post("/api/vendors/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "E-post og passord er p\xE5krevd" });
      }
      const [vendor] = await db.select().from(vendors).where(eq2(vendors.email, email));
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
        expiresAt
      });
      const { password: _, ...vendorWithoutPassword } = vendor;
      res.json({ vendor: vendorWithoutPassword, sessionToken });
    } catch (error) {
      console.error("Error logging in vendor:", error);
      res.status(500).json({ error: "Kunne ikke logge inn" });
    }
  });
  app2.post("/api/vendors/google-login", async (req, res) => {
    try {
      const { googleEmail, googleName, googleId } = req.body;
      if (!googleEmail || !googleName) {
        return res.status(400).json({ error: "Google informasjon mangler" });
      }
      const [existingVendor] = await db.select().from(vendors).where(eq2(vendors.email, googleEmail));
      if (existingVendor) {
        if (existingVendor.status === "approved") {
          const sessionToken = generateSessionToken();
          const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
          await db.insert(vendorSessions).values({
            vendorId: existingVendor.id,
            token: sessionToken,
            expiresAt
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
            message: "Din s\xF8knad venter p\xE5 godkjenning. Du vil motta en e-post n\xE5r den er behandlet."
          });
        } else if (existingVendor.status === "rejected") {
          return res.status(403).json({
            status: "rejected",
            message: `Din s\xF8knad ble avvist. \xC5rsak: ${existingVendor.rejectionReason || "Ikke spesifisert"}`,
            rejectionReason: existingVendor.rejectionReason
          });
        }
      }
      const newVendorId = generateSessionToken().substring(0, 21);
      const [newVendor] = await db.insert(vendors).values({
        id: newVendorId,
        email: googleEmail,
        password: generateSessionToken(),
        // Random password since using OAuth
        businessName: googleName || "Min Bedrift",
        status: "pending",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      res.status(201).json({
        vendor: {
          id: newVendor.id,
          email: newVendor.email,
          businessName: newVendor.businessName,
          status: newVendor.status
        },
        status: "pending",
        message: "Konto opprettet! Din s\xF8knad venter p\xE5 godkjenning."
      });
    } catch (error) {
      console.error("Error with Google vendor login:", error);
      res.status(500).json({ error: "Kunne ikke logge inn med Google" });
    }
  });
  app2.post("/api/vendors/logout", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      await db.delete(vendorSessions).where(eq2(vendorSessions.token, token));
    }
    res.json({ message: "Logget ut" });
  });
  app2.get("/api/vendor/session", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ valid: false, error: "Ikke autorisert" });
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    try {
      const [vendorSession] = await db.select({ vendorId: vendorSessions.vendorId }).from(vendorSessions).where(and2(
        eq2(vendorSessions.token, token),
        sql3`${vendorSessions.expiresAt} > NOW()`
      ));
      if (!vendorSession) {
        res.status(401).json({ valid: false, error: "\xD8kt utl\xF8pt" });
        return;
      }
      const [vendor] = await db.select().from(vendors).where(eq2(vendors.id, vendorSession.vendorId));
      if (!vendor || vendor.status !== "approved") {
        res.status(401).json({ valid: false, error: "Ikke autorisert" });
        return;
      }
      res.json({ valid: true, vendorId: vendorSession.vendorId, businessName: vendor.businessName });
    } catch (error) {
      res.status(500).json({ valid: false, error: "Serverfeil" });
    }
  });
  app2.get("/api/vendors", async (req, res) => {
    try {
      const categoryId = req.query.categoryId;
      let query = db.select({
        id: vendors.id,
        businessName: vendors.businessName,
        categoryId: vendors.categoryId,
        description: vendors.description,
        location: vendors.location,
        phone: vendors.phone,
        website: vendors.website,
        priceRange: vendors.priceRange,
        imageUrl: vendors.imageUrl
      }).from(vendors).where(eq2(vendors.status, "approved"));
      const approvedVendors = await query;
      const filtered = categoryId ? approvedVendors.filter((v) => v.categoryId === categoryId) : approvedVendors;
      res.json(filtered);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente leverand\xF8rer" });
    }
  });
  const checkAdminAuth = (req, res) => {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      res.status(503).json({ error: "Admin-funksjonalitet er ikke konfigurert" });
      return false;
    }
    const authHeader = req.headers.authorization;
    console.log("Auth check - Header:", authHeader, "Expected:", `Bearer ${adminSecret}`);
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      console.error("Auth failed - Header does not match expected value");
      res.status(401).json({ error: "Ikke autorisert" });
      return false;
    }
    return true;
  };
  app2.get("/api/admin/vendors", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const status = req.query.status || "pending";
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
        createdAt: vendors.createdAt
      }).from(vendors).where(eq2(vendors.status, status));
      res.json(vendorList);
    } catch (error) {
      console.error("Error fetching admin vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente leverand\xF8rer" });
    }
  });
  app2.post("/api/admin/vendors/:id/approve", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.update(vendors).set({ status: "approved", updatedAt: /* @__PURE__ */ new Date() }).where(eq2(vendors.id, id));
      res.json({ message: "Leverand\xF8r godkjent" });
    } catch (error) {
      console.error("Error approving vendor:", error);
      res.status(500).json({ error: "Kunne ikke godkjenne leverand\xF8r" });
    }
  });
  app2.post("/api/admin/vendors/:id/reject", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { reason } = req.body;
      await db.update(vendors).set({
        status: "rejected",
        rejectionReason: reason || null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(vendors.id, id));
      res.json({ message: "Leverand\xF8r avvist" });
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      res.status(500).json({ error: "Kunne ikke avvise leverand\xF8r" });
    }
  });
  const checkVendorAuth2 = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Ikke autorisert" });
      return null;
    }
    const token = authHeader.replace("Bearer ", "");
    const [vendorSession] = await db.select({ vendorId: vendorSessions.vendorId }).from(vendorSessions).where(and2(
      eq2(vendorSessions.token, token),
      sql3`${vendorSessions.expiresAt} > NOW()`
    ));
    if (!vendorSession) {
      res.status(401).json({ error: "\xD8kt utl\xF8pt. Vennligst logg inn p\xE5 nytt." });
      return null;
    }
    const [vendor] = await db.select().from(vendors).where(eq2(vendors.id, vendorSession.vendorId));
    if (!vendor || vendor.status !== "approved") {
      res.status(401).json({ error: "Ikke autorisert" });
      return null;
    }
    return vendorSession.vendorId;
  };
  app2.get("/api/vendor/profile", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const [vendor] = await db.select().from(vendors).where(eq2(vendors.id, vendorId));
      if (!vendor) {
        return res.status(404).json({ error: "Leverand\xF8r ikke funnet" });
      }
      let category = null;
      if (vendor.categoryId) {
        const [cat] = await db.select().from(vendorCategories).where(eq2(vendorCategories.id, vendor.categoryId));
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
        category
      });
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      res.status(500).json({ error: "Kunne ikke hente profil" });
    }
  });
  app2.patch("/api/vendor/profile", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { businessName, organizationNumber, description, location, phone, website, priceRange, googleReviewUrl } = req.body;
      if (!businessName || businessName.trim().length < 2) {
        return res.status(400).json({ error: "Bedriftsnavn er p\xE5krevd" });
      }
      const [updatedVendor] = await db.update(vendors).set({
        businessName: businessName.trim(),
        organizationNumber: organizationNumber || null,
        description: description || null,
        location: location || null,
        phone: phone || null,
        website: website || null,
        priceRange: priceRange || null,
        googleReviewUrl: googleReviewUrl || null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(vendors.id, vendorId)).returning();
      res.json(updatedVendor);
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere profil" });
    }
  });
  app2.get("/api/vendor/deliveries", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const vendorDeliveries = await db.select().from(deliveries).where(eq2(deliveries.vendorId, vendorId));
      const deliveriesWithItems = await Promise.all(
        vendorDeliveries.map(async (delivery) => {
          const items = await db.select().from(deliveryItems).where(eq2(deliveryItems.deliveryId, delivery.id));
          return { ...delivery, items };
        })
      );
      res.json(deliveriesWithItems);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      res.status(500).json({ error: "Kunne ikke hente leveranser" });
    }
  });
  app2.post("/api/vendor/deliveries", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
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
        accessCode
      }).returning();
      await Promise.all(
        items.map(
          (item, index) => db.insert(deliveryItems).values({
            deliveryId: newDelivery.id,
            type: item.type,
            label: item.label,
            url: item.url,
            description: item.description || null,
            sortOrder: index
          })
        )
      );
      const createdItems = await db.select().from(deliveryItems).where(eq2(deliveryItems.deliveryId, newDelivery.id));
      res.status(201).json({
        delivery: { ...newDelivery, items: createdItems },
        message: `Leveranse opprettet! Tilgangskode: ${accessCode}`
      });
    } catch (error) {
      console.error("Error creating delivery:", error);
      res.status(500).json({ error: "Kunne ikke opprette leveranse" });
    }
  });
  app2.patch("/api/vendor/deliveries/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const { items, ...deliveryData } = req.body;
      const [existing] = await db.select().from(deliveries).where(and2(
        eq2(deliveries.id, id),
        eq2(deliveries.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Leveranse ikke funnet" });
      }
      const [updated] = await db.update(deliveries).set({
        coupleName: deliveryData.coupleName,
        coupleEmail: deliveryData.coupleEmail || null,
        title: deliveryData.title,
        description: deliveryData.description || null,
        weddingDate: deliveryData.weddingDate || null,
        status: deliveryData.status || existing.status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(deliveries.id, id)).returning();
      if (items && Array.isArray(items)) {
        await db.delete(deliveryItems).where(eq2(deliveryItems.deliveryId, id));
        await Promise.all(
          items.map(
            (item, index) => db.insert(deliveryItems).values({
              deliveryId: id,
              type: item.type,
              label: item.label,
              url: item.url,
              description: item.description || null,
              sortOrder: index
            })
          )
        );
      }
      const updatedItems = await db.select().from(deliveryItems).where(eq2(deliveryItems.deliveryId, id));
      res.json({
        delivery: { ...updated, items: updatedItems },
        message: "Leveranse oppdatert!"
      });
    } catch (error) {
      console.error("Error updating delivery:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere leveranse" });
    }
  });
  app2.delete("/api/vendor/deliveries/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(deliveries).where(and2(
        eq2(deliveries.id, id),
        eq2(deliveries.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Leveranse ikke funnet" });
      }
      await db.delete(deliveryItems).where(eq2(deliveryItems.deliveryId, id));
      await db.delete(deliveries).where(eq2(deliveries.id, id));
      res.json({ message: "Leveranse slettet" });
    } catch (error) {
      console.error("Error deleting delivery:", error);
      res.status(500).json({ error: "Kunne ikke slette leveranse" });
    }
  });
  app2.get("/api/deliveries/:accessCode", async (req, res) => {
    try {
      const { accessCode } = req.params;
      const [delivery] = await db.select().from(deliveries).where(eq2(deliveries.accessCode, accessCode.toUpperCase()));
      if (!delivery || delivery.status !== "active") {
        return res.status(404).json({ error: "Leveranse ikke funnet" });
      }
      const [vendor] = await db.select({
        businessName: vendors.businessName,
        categoryId: vendors.categoryId
      }).from(vendors).where(eq2(vendors.id, delivery.vendorId));
      const items = await db.select().from(deliveryItems).where(eq2(deliveryItems.deliveryId, delivery.id));
      res.json({
        delivery: { ...delivery, items },
        vendor
      });
    } catch (error) {
      console.error("Error fetching delivery:", error);
      res.status(500).json({ error: "Kunne ikke hente leveranse" });
    }
  });
  app2.get("/api/inspiration-categories", async (_req, res) => {
    try {
      const categories = await db.select().from(inspirationCategories);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching inspiration categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });
  app2.get("/api/inspirations", async (req, res) => {
    try {
      const categoryId = req.query.categoryId;
      const approvedInspirations = await db.select().from(inspirations).where(eq2(inspirations.status, "approved"));
      const filtered = categoryId ? approvedInspirations.filter((i) => i.categoryId === categoryId) : approvedInspirations;
      const inspirationsWithDetails = await Promise.all(
        filtered.map(async (insp) => {
          const media = await db.select().from(inspirationMedia).where(eq2(inspirationMedia.inspirationId, insp.id));
          const [vendor] = await db.select({
            id: vendors.id,
            businessName: vendors.businessName
          }).from(vendors).where(eq2(vendors.id, insp.vendorId));
          const [category] = await db.select().from(inspirationCategories).where(eq2(inspirationCategories.id, insp.categoryId || ""));
          return { ...insp, media, vendor, category };
        })
      );
      res.json(inspirationsWithDetails);
    } catch (error) {
      console.error("Error fetching inspirations:", error);
      res.status(500).json({ error: "Kunne ikke hente inspirasjoner" });
    }
  });
  app2.get("/api/vendor/inspirations", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const vendorInspirations = await db.select().from(inspirations).where(eq2(inspirations.vendorId, vendorId));
      const inspirationsWithMedia = await Promise.all(
        vendorInspirations.map(async (insp) => {
          const media = await db.select().from(inspirationMedia).where(eq2(inspirationMedia.inspirationId, insp.id));
          const [category] = await db.select().from(inspirationCategories).where(eq2(inspirationCategories.id, insp.categoryId || ""));
          return { ...insp, media, category };
        })
      );
      res.json(inspirationsWithMedia);
    } catch (error) {
      console.error("Error fetching vendor inspirations:", error);
      res.status(500).json({ error: "Kunne ikke hente inspirasjoner" });
    }
  });
  app2.post("/api/vendor/inspirations", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const featureRows = await db.select().from(vendorFeatures).where(and2(eq2(vendorFeatures.vendorId, vendorId), eq2(vendorFeatures.featureKey, "inspirations")));
      if (featureRows.length > 0 && !featureRows[0].isEnabled) {
        return res.status(403).json({ error: "Inspirasjoner er deaktivert for denne kontoen" });
      }
      const validation = createInspirationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Ugyldig data",
          details: validation.error.errors
        });
      }
      const { media, ...inspirationData } = validation.data;
      const assignments = await db.select().from(vendorInspirationCategories).where(eq2(vendorInspirationCategories.vendorId, vendorId));
      if (assignments.length > 0) {
        const allowedCategoryIds = assignments.map((a) => a.categoryId);
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
        allowInquiryForm: inspirationData.allowInquiryForm || false
      }).returning();
      await Promise.all(
        media.map(
          (item, index) => db.insert(inspirationMedia).values({
            inspirationId: newInspiration.id,
            type: item.type,
            url: item.url,
            caption: item.caption || null,
            sortOrder: index
          })
        )
      );
      const createdMedia = await db.select().from(inspirationMedia).where(eq2(inspirationMedia.inspirationId, newInspiration.id));
      res.status(201).json({
        inspiration: { ...newInspiration, media: createdMedia },
        message: "Inspirasjon opprettet! Den vil bli synlig etter godkjenning."
      });
    } catch (error) {
      console.error("Error creating inspiration:", error);
      res.status(500).json({ error: "Kunne ikke opprette inspirasjon" });
    }
  });
  app2.patch("/api/vendor/inspirations/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const { media, ...inspirationData } = req.body;
      const [existing] = await db.select().from(inspirations).where(and2(
        eq2(inspirations.id, id),
        eq2(inspirations.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Showcase ikke funnet" });
      }
      const [updated] = await db.update(inspirations).set({
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
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(inspirations.id, id)).returning();
      if (media && Array.isArray(media)) {
        await db.delete(inspirationMedia).where(eq2(inspirationMedia.inspirationId, id));
        await Promise.all(
          media.map(
            (item, index) => db.insert(inspirationMedia).values({
              inspirationId: id,
              type: item.type,
              url: item.url,
              caption: item.caption || null,
              sortOrder: index
            })
          )
        );
      }
      const updatedMedia = await db.select().from(inspirationMedia).where(eq2(inspirationMedia.inspirationId, id));
      res.json({
        inspiration: { ...updated, media: updatedMedia },
        message: "Showcase oppdatert! Endringer vil bli synlig etter godkjenning."
      });
    } catch (error) {
      console.error("Error updating inspiration:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere showcase" });
    }
  });
  app2.delete("/api/vendor/inspirations/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(inspirations).where(and2(
        eq2(inspirations.id, id),
        eq2(inspirations.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Showcase ikke funnet" });
      }
      await db.delete(inspirationMedia).where(eq2(inspirationMedia.inspirationId, id));
      await db.delete(inspirations).where(eq2(inspirations.id, id));
      res.json({ message: "Showcase slettet" });
    } catch (error) {
      console.error("Error deleting inspiration:", error);
      res.status(500).json({ error: "Kunne ikke slette showcase" });
    }
  });
  app2.get("/api/admin/inspirations", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const status = req.query.status || "pending";
      const inspirationList = await db.select().from(inspirations).where(eq2(inspirations.status, status));
      const inspirationsWithDetails = await Promise.all(
        inspirationList.map(async (insp) => {
          const media = await db.select().from(inspirationMedia).where(eq2(inspirationMedia.inspirationId, insp.id));
          const [vendor] = await db.select({
            id: vendors.id,
            businessName: vendors.businessName
          }).from(vendors).where(eq2(vendors.id, insp.vendorId));
          const [category] = await db.select().from(inspirationCategories).where(eq2(inspirationCategories.id, insp.categoryId || ""));
          return { ...insp, media, vendor, category };
        })
      );
      res.json(inspirationsWithDetails);
    } catch (error) {
      console.error("Error fetching admin inspirations:", error);
      res.status(500).json({ error: "Kunne ikke hente inspirasjoner" });
    }
  });
  app2.post("/api/admin/inspirations/:id/approve", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.update(inspirations).set({ status: "approved", updatedAt: /* @__PURE__ */ new Date() }).where(eq2(inspirations.id, id));
      res.json({ message: "Inspirasjon godkjent" });
    } catch (error) {
      console.error("Error approving inspiration:", error);
      res.status(500).json({ error: "Kunne ikke godkjenne inspirasjon" });
    }
  });
  app2.post("/api/admin/inspirations/:id/reject", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { reason } = req.body;
      await db.update(inspirations).set({
        status: "rejected",
        rejectionReason: reason || null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(inspirations.id, id));
      res.json({ message: "Inspirasjon avvist" });
    } catch (error) {
      console.error("Error rejecting inspiration:", error);
      res.status(500).json({ error: "Kunne ikke avvise inspirasjon" });
    }
  });
  app2.get("/api/admin/vendors/:id/features", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const features = await db.select().from(vendorFeatures).where(eq2(vendorFeatures.vendorId, id));
      res.json(features);
    } catch (error) {
      console.error("Error fetching vendor features:", error);
      res.status(500).json({ error: "Kunne ikke hente funksjoner" });
    }
  });
  const VALID_FEATURE_KEYS = ["deliveries", "inspirations"];
  app2.put("/api/admin/vendors/:id/features", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { features } = req.body;
      if (!Array.isArray(features)) {
        return res.status(400).json({ error: "Ugyldig format" });
      }
      for (const feature of features) {
        if (!VALID_FEATURE_KEYS.includes(feature.featureKey)) {
          return res.status(400).json({ error: `Ugyldig funksjonsn\xF8kkel: ${feature.featureKey}` });
        }
      }
      for (const feature of features) {
        const existing = await db.select().from(vendorFeatures).where(and2(eq2(vendorFeatures.vendorId, id), eq2(vendorFeatures.featureKey, feature.featureKey)));
        if (existing.length > 0) {
          await db.update(vendorFeatures).set({ isEnabled: feature.isEnabled, updatedAt: /* @__PURE__ */ new Date() }).where(and2(eq2(vendorFeatures.vendorId, id), eq2(vendorFeatures.featureKey, feature.featureKey)));
        } else {
          await db.insert(vendorFeatures).values({
            vendorId: id,
            featureKey: feature.featureKey,
            isEnabled: feature.isEnabled
          });
        }
      }
      res.json({ message: "Funksjoner oppdatert" });
    } catch (error) {
      console.error("Error updating vendor features:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere funksjoner" });
    }
  });
  app2.get("/api/admin/vendors/:id/inspiration-categories", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const assignments = await db.select().from(vendorInspirationCategories).where(eq2(vendorInspirationCategories.vendorId, id));
      res.json(assignments.map((a) => a.categoryId));
    } catch (error) {
      console.error("Error fetching vendor categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });
  app2.put("/api/admin/vendors/:id/inspiration-categories", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { categoryIds } = req.body;
      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({ error: "Ugyldig format" });
      }
      if (categoryIds.length > 0) {
        const validCategories = await db.select({ id: inspirationCategories.id }).from(inspirationCategories);
        const validCategoryIds = validCategories.map((c) => c.id);
        for (const catId of categoryIds) {
          if (!validCategoryIds.includes(catId)) {
            return res.status(400).json({ error: `Ugyldig kategori-ID: ${catId}` });
          }
        }
      }
      await db.delete(vendorInspirationCategories).where(eq2(vendorInspirationCategories.vendorId, id));
      if (categoryIds.length > 0) {
        await db.insert(vendorInspirationCategories).values(
          categoryIds.map((categoryId) => ({
            vendorId: id,
            categoryId
          }))
        );
      }
      res.json({ message: "Kategorier oppdatert" });
    } catch (error) {
      console.error("Error updating vendor categories:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategorier" });
    }
  });
  app2.get("/api/vendor/allowed-categories", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const assignments = await db.select().from(vendorInspirationCategories).where(eq2(vendorInspirationCategories.vendorId, vendorId));
      if (assignments.length === 0) {
        const allCategories = await db.select().from(inspirationCategories);
        res.json(allCategories);
      } else {
        const categoryIds = assignments.map((a) => a.categoryId);
        const allowedCategories = await db.select().from(inspirationCategories);
        res.json(allowedCategories.filter((c) => categoryIds.includes(c.id)));
      }
    } catch (error) {
      console.error("Error fetching allowed categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });
  app2.get("/api/vendor/features", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const features = await db.select().from(vendorFeatures).where(eq2(vendorFeatures.vendorId, vendorId));
      const featureMap = {
        deliveries: true,
        inspirations: true
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
  app2.post("/api/inspirations/:id/inquiry", async (req, res) => {
    try {
      const { id } = req.params;
      const validation = createInquirySchema.safeParse({ ...req.body, inspirationId: id });
      if (!validation.success) {
        return res.status(400).json({
          error: "Ugyldig data",
          details: validation.error.errors
        });
      }
      const [inspiration] = await db.select().from(inspirations).where(eq2(inspirations.id, id));
      if (!inspiration || inspiration.status !== "approved") {
        return res.status(404).json({ error: "Inspirasjon ikke funnet" });
      }
      const featureRows = await db.select().from(vendorFeatures).where(and2(eq2(vendorFeatures.vendorId, inspiration.vendorId), eq2(vendorFeatures.featureKey, "inspirations")));
      if (featureRows.length > 0 && !featureRows[0].isEnabled) {
        return res.status(403).json({ error: "Denne leverand\xF8ren har deaktivert inspirasjoner" });
      }
      if (!inspiration.allowInquiryForm) {
        return res.status(400).json({ error: "Foresp\xF8rsler er ikke aktivert for denne inspirasjonen" });
      }
      const { inspirationId, ...inquiryData } = validation.data;
      await db.insert(inspirationInquiries).values({
        inspirationId: id,
        vendorId: inspiration.vendorId,
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone || null,
        message: inquiryData.message,
        weddingDate: inquiryData.weddingDate || null
      });
      res.status(201).json({ message: "Foresp\xF8rsel sendt!" });
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(500).json({ error: "Kunne ikke sende foresp\xF8rsel" });
    }
  });
  app2.get("/api/vendor/inquiries", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const inquiries = await db.select().from(inspirationInquiries).where(eq2(inspirationInquiries.vendorId, vendorId));
      const inquiriesWithDetails = await Promise.all(
        inquiries.map(async (inq) => {
          const [insp] = await db.select({ title: inspirations.title }).from(inspirations).where(eq2(inspirations.id, inq.inspirationId));
          return { ...inq, inspirationTitle: insp?.title };
        })
      );
      res.json(inquiriesWithDetails);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ error: "Kunne ikke hente foresp\xF8rsler" });
    }
  });
  app2.patch("/api/vendor/inquiries/:id/status", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const { status } = req.body;
      const [inquiry] = await db.select().from(inspirationInquiries).where(eq2(inspirationInquiries.id, id));
      if (!inquiry || inquiry.vendorId !== vendorId) {
        return res.status(404).json({ error: "Foresp\xF8rsel ikke funnet" });
      }
      await db.update(inspirationInquiries).set({ status }).where(eq2(inspirationInquiries.id, id));
      res.json({ message: "Status oppdatert" });
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere status" });
    }
  });
  async function checkCoupleAuth(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Ikke autentisert" });
      return null;
    }
    const token = authHeader.substring(7);
    const cached = COUPLE_SESSIONS.get(token);
    if (cached && cached.expiresAt > /* @__PURE__ */ new Date()) {
      return cached.coupleId;
    }
    const [session] = await db.select().from(coupleSessions).where(eq2(coupleSessions.token, token));
    if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
      res.status(401).json({ error: "Sesjon utl\xF8pt" });
      return null;
    }
    COUPLE_SESSIONS.set(token, { coupleId: session.coupleId, expiresAt: session.expiresAt });
    return session.coupleId;
  }
  app2.post("/api/couples/login", async (req, res) => {
    try {
      const validation = coupleLoginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { email, displayName, password } = validation.data;
      let [couple] = await db.select().from(coupleProfiles).where(eq2(coupleProfiles.email, email));
      if (!couple) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [newCouple] = await db.insert(coupleProfiles).values({ email, displayName, password: hashedPassword }).returning();
        couple = newCouple;
      } else {
        if (!couple.password) {
          return res.status(401).json({ error: "Kontoen din har ingen passord. Kontakt support." });
        }
        const passwordMatch = await bcrypt.compare(password, couple.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Ugyldig e-post eller passord" });
        }
        if (couple.displayName !== displayName) {
          await db.update(coupleProfiles).set({ displayName, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(coupleProfiles.id, couple.id));
          couple.displayName = displayName;
        }
      }
      const token = generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      await db.insert(coupleSessions).values({
        coupleId: couple.id,
        token,
        expiresAt
      });
      COUPLE_SESSIONS.set(token, { coupleId: couple.id, expiresAt });
      res.json({ couple, sessionToken: token });
    } catch (error) {
      console.error("Couple login error:", error);
      res.status(500).json({ error: "Kunne ikke logge inn" });
    }
  });
  app2.post("/api/couples/logout", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      COUPLE_SESSIONS.delete(token);
      await db.delete(coupleSessions).where(eq2(coupleSessions.token, token));
    }
    res.json({ message: "Logget ut" });
  });
  app2.get("/api/couples/me", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }
      res.json(couple);
    } catch (error) {
      console.error("Error fetching couple profile:", error);
      res.status(500).json({ error: "Kunne ikke hente profil" });
    }
  });
  app2.get("/api/couples/conversations", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const convos = await db.select().from(conversations).where(and2(
        eq2(conversations.coupleId, coupleId),
        eq2(conversations.deletedByCouple, false)
      )).orderBy(desc(conversations.lastMessageAt));
      const enriched = await Promise.all(convos.map(async (conv) => {
        const [vendor] = await db.select({ id: vendors.id, businessName: vendors.businessName }).from(vendors).where(eq2(vendors.id, conv.vendorId));
        let inspiration = null;
        if (conv.inspirationId) {
          const [insp] = await db.select({ id: inspirations.id, title: inspirations.title, coverImageUrl: inspirations.coverImageUrl }).from(inspirations).where(eq2(inspirations.id, conv.inspirationId));
          inspiration = insp;
        }
        const [lastMsg] = await db.select().from(messages).where(eq2(messages.conversationId, conv.id)).orderBy(desc(messages.createdAt)).limit(1);
        return { ...conv, vendor, inspiration, lastMessage: lastMsg };
      }));
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Kunne ikke hente samtaler" });
    }
  });
  app2.get("/api/vendor/conversations", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const convos = await db.select().from(conversations).where(and2(
        eq2(conversations.vendorId, vendorId),
        eq2(conversations.deletedByVendor, false)
      )).orderBy(desc(conversations.lastMessageAt));
      const enriched = await Promise.all(convos.map(async (conv) => {
        const [couple] = await db.select({ id: coupleProfiles.id, displayName: coupleProfiles.displayName, email: coupleProfiles.email }).from(coupleProfiles).where(eq2(coupleProfiles.id, conv.coupleId));
        let inspiration = null;
        if (conv.inspirationId) {
          const [insp] = await db.select({ id: inspirations.id, title: inspirations.title }).from(inspirations).where(eq2(inspirations.id, conv.inspirationId));
          inspiration = insp;
        }
        const [lastMsg] = await db.select().from(messages).where(eq2(messages.conversationId, conv.id)).orderBy(desc(messages.createdAt)).limit(1);
        return { ...conv, couple, inspiration, lastMessage: lastMsg };
      }));
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching vendor conversations:", error);
      res.status(500).json({ error: "Kunne ikke hente samtaler" });
    }
  });
  app2.get("/api/vendor/conversations/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(and2(
        eq2(conversations.id, id),
        eq2(conversations.vendorId, vendorId)
      ));
      if (!conv) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const [couple] = await db.select({
        id: coupleProfiles.id,
        displayName: coupleProfiles.displayName,
        email: coupleProfiles.email
      }).from(coupleProfiles).where(eq2(coupleProfiles.id, conv.coupleId));
      let inspiration = null;
      if (conv.inspirationId) {
        const [insp] = await db.select({ id: inspirations.id, title: inspirations.title }).from(inspirations).where(eq2(inspirations.id, conv.inspirationId));
        inspiration = insp;
      }
      const [lastMsg] = await db.select().from(messages).where(eq2(messages.conversationId, conv.id)).orderBy(desc(messages.createdAt)).limit(1);
      res.json({ ...conv, couple, inspiration, lastMessage: lastMsg });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Kunne ikke hente samtale" });
    }
  });
  app2.get("/api/couples/conversations/:id/messages", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const msgs = await db.select().from(messages).where(and2(
        eq2(messages.conversationId, id),
        eq2(messages.deletedByCouple, false)
      )).orderBy(messages.createdAt);
      await db.update(conversations).set({ coupleUnreadCount: 0 }).where(eq2(conversations.id, id));
      res.json(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Kunne ikke hente meldinger" });
    }
  });
  app2.get("/api/couples/conversations/:id/details", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const [vendor] = await db.select().from(vendors).where(eq2(vendors.id, conv.vendorId));
      res.json({
        conversation: conv,
        vendor: vendor ? {
          id: vendor.id,
          businessName: vendor.businessName,
          email: vendor.email,
          phone: vendor.phone
        } : null,
        vendorTypingAt: conv.vendorTypingAt
      });
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      res.status(500).json({ error: "Kunne ikke hente samtaledetaljer" });
    }
  });
  app2.get("/api/vendor/conversations/:id/messages", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const msgs = await db.select().from(messages).where(and2(
        eq2(messages.conversationId, id),
        eq2(messages.deletedByVendor, false)
      )).orderBy(messages.createdAt);
      await db.update(conversations).set({ vendorUnreadCount: 0 }).where(eq2(conversations.id, id));
      res.json(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Kunne ikke hente meldinger" });
    }
  });
  app2.post("/api/couples/messages", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const validation = sendMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { conversationId, vendorId, inspirationId, body, attachmentUrl, attachmentType } = validation.data;
      let convId = conversationId;
      if (!convId && vendorId) {
        let [existing] = await db.select().from(conversations).where(and2(eq2(conversations.coupleId, coupleId), eq2(conversations.vendorId, vendorId)));
        if (existing) {
          convId = existing.id;
        } else {
          const [newConv] = await db.insert(conversations).values({
            coupleId,
            vendorId,
            inspirationId: inspirationId || null,
            status: "active",
            lastMessageAt: /* @__PURE__ */ new Date(),
            vendorUnreadCount: 1
          }).returning();
          convId = newConv.id;
        }
      }
      if (!convId) {
        return res.status(400).json({ error: "Mangler samtale eller leverand\xF8r-ID" });
      }
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, convId));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }
      const [msg] = await db.insert(messages).values({
        conversationId: convId,
        senderType: "couple",
        senderId: coupleId,
        body: body || "",
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null
      }).returning();
      await db.update(conversations).set({
        lastMessageAt: /* @__PURE__ */ new Date(),
        vendorUnreadCount: (conv.vendorUnreadCount || 0) + 1
      }).where(eq2(conversations.id, convId));
      broadcastConversation(convId, { type: "message", payload: msg });
      const msgCreatedAt = msg.createdAt || /* @__PURE__ */ new Date();
      broadcastVendorList(conv.vendorId, { type: "conv-update", payload: { conversationId: convId, lastMessageAt: msgCreatedAt.toISOString(), vendorUnreadCount: (conv.vendorUnreadCount || 0) + 1 } });
      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Kunne ikke sende melding" });
    }
  });
  app2.post("/api/vendor/messages", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { conversationId, body, attachmentUrl, attachmentType } = req.body;
      if (!conversationId || !body && !attachmentUrl) {
        return res.status(400).json({ error: "Mangler samtale-ID eller melding" });
      }
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }
      const [msg] = await db.insert(messages).values({
        conversationId,
        senderType: "vendor",
        senderId: vendorId,
        body: body || "",
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null
      }).returning();
      await db.update(conversations).set({
        lastMessageAt: /* @__PURE__ */ new Date(),
        coupleUnreadCount: (conv.coupleUnreadCount || 0) + 1
      }).where(eq2(conversations.id, conversationId));
      broadcastConversation(conversationId, { type: "message", payload: msg });
      const msgCreatedAt = msg.createdAt || /* @__PURE__ */ new Date();
      broadcastCoupleList(conv.coupleId, { type: "conv-update", payload: { conversationId, lastMessageAt: msgCreatedAt.toISOString(), coupleUnreadCount: (conv.coupleUnreadCount || 0) + 1 } });
      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending vendor message:", error);
      res.status(500).json({ error: "Kunne ikke sende melding" });
    }
  });
  app2.get("/api/vendor/admin/conversation", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const existing = await db.select().from(adminConversations).where(eq2(adminConversations.vendorId, vendorId));
      let conv = existing[0];
      if (!conv) {
        const [created] = await db.insert(adminConversations).values({ vendorId }).returning();
        conv = created;
      }
      res.json(conv);
    } catch (error) {
      console.error("Error fetching admin conversation:", error);
      res.status(500).json({ error: "Kunne ikke hente admin-samtale" });
    }
  });
  app2.get("/api/vendor/admin/messages", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const [conv] = await db.select().from(adminConversations).where(eq2(adminConversations.vendorId, vendorId));
      if (!conv) {
        return res.json([]);
      }
      const msgs = await db.select().from(adminMessages).where(eq2(adminMessages.conversationId, conv.id)).orderBy(desc(adminMessages.createdAt));
      await db.update(adminConversations).set({ vendorUnreadCount: 0 }).where(eq2(adminConversations.id, conv.id));
      res.json(msgs);
    } catch (error) {
      console.error("Error fetching admin messages:", error);
      res.status(500).json({ error: "Kunne ikke hente admin-meldinger" });
    }
  });
  app2.post("/api/vendor/admin/messages", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { body, attachmentUrl, attachmentType } = req.body;
      const parse = sendAdminMessageSchema.safeParse({ body, attachmentUrl, attachmentType });
      if (!parse.success) {
        return res.status(400).json({ error: parse.error.errors[0]?.message || "Ugyldig melding" });
      }
      const [conv] = await db.select().from(adminConversations).where(eq2(adminConversations.vendorId, vendorId));
      let conversationId = conv?.id;
      if (!conversationId) {
        const [created] = await db.insert(adminConversations).values({ vendorId }).returning();
        conversationId = created.id;
      }
      const [msg] = await db.insert(adminMessages).values({
        conversationId,
        senderType: "vendor",
        senderId: vendorId,
        body,
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null
      }).returning();
      const newLast = /* @__PURE__ */ new Date();
      const newAdminUnread = (conv?.adminUnreadCount || 0) + 1;
      await db.update(adminConversations).set({
        lastMessageAt: newLast,
        adminUnreadCount: newAdminUnread
      }).where(eq2(adminConversations.id, conversationId));
      broadcastAdminConv(conversationId, { type: "message", payload: msg });
      broadcastAdminList({ type: "conv-update", payload: { conversationId, lastMessageAt: newLast.toISOString(), adminUnreadCount: newAdminUnread } });
      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending admin message:", error);
      res.status(500).json({ error: "Kunne ikke sende melding til admin" });
    }
  });
  app2.get("/api/admin/vendor-admin-conversations", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const rows = await db.select({
        conv: adminConversations,
        vendor: vendors
      }).from(adminConversations).leftJoin(vendors, eq2(adminConversations.vendorId, vendors.id)).orderBy(desc(adminConversations.lastMessageAt));
      res.json(rows);
    } catch (error) {
      console.error("Error listing admin convs:", error);
      res.status(500).json({ error: "Kunne ikke liste admin-samtaler" });
    }
  });
  app2.get("/api/admin/vendor-admin-conversations/:id/messages", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const msgs = await db.select().from(adminMessages).where(eq2(adminMessages.conversationId, id)).orderBy(desc(adminMessages.createdAt));
      await db.update(adminConversations).set({ adminUnreadCount: 0 }).where(eq2(adminConversations.id, id));
      res.json(msgs);
    } catch (error) {
      console.error("Error fetching admin msgs:", error);
      res.status(500).json({ error: "Kunne ikke hente meldinger" });
    }
  });
  app2.post("/api/admin/vendor-admin-conversations/:id/messages", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { body, attachmentUrl, attachmentType } = req.body;
      const parse = sendAdminMessageSchema.safeParse({ body, attachmentUrl, attachmentType });
      if (!parse.success) {
        return res.status(400).json({ error: parse.error.errors[0]?.message || "Ugyldig melding" });
      }
      const [msg] = await db.insert(adminMessages).values({
        conversationId: id,
        senderType: "admin",
        senderId: "admin",
        body,
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null
      }).returning();
      const newLast = /* @__PURE__ */ new Date();
      await db.update(adminConversations).set({
        lastMessageAt: newLast,
        vendorUnreadCount: sql3`COALESCE(${adminConversations.vendorUnreadCount}, 0) + 1`
      }).where(eq2(adminConversations.id, id));
      broadcastAdminConv(id, { type: "message", payload: msg });
      broadcastAdminList({ type: "conv-update", payload: { conversationId: id, lastMessageAt: newLast.toISOString() } });
      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending admin reply:", error);
      res.status(500).json({ error: "Kunne ikke sende admin-svar" });
    }
  });
  app2.post("/api/admin/vendor-admin-conversations/:id/typing", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      broadcastAdminConv(id, { type: "typing", payload: { sender: "admin", at: (/* @__PURE__ */ new Date()).toISOString() } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Kunne ikke sende skrive-status" });
    }
  });
  app2.patch("/api/couples/messages/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { body } = req.body;
      if (!body || typeof body !== "string" || body.trim() === "") {
        return res.status(400).json({ error: "Melding kan ikke v\xE6re tom" });
      }
      const [msg] = await db.select().from(messages).where(eq2(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }
      if (msg.senderType !== "couple" || msg.senderId !== coupleId) {
        return res.status(403).json({ error: "Du kan bare redigere dine egne meldinger" });
      }
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, msg.conversationId));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }
      const [updated] = await db.update(messages).set({
        body: body.trim(),
        editedAt: /* @__PURE__ */ new Date()
      }).where(eq2(messages.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error editing message:", error);
      res.status(500).json({ error: "Kunne ikke redigere melding" });
    }
  });
  app2.post("/api/vendor/conversations/:id/typing", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }
      await db.update(conversations).set({
        vendorTypingAt: /* @__PURE__ */ new Date()
      }).where(eq2(conversations.id, id));
      broadcastConversation(id, { type: "typing", payload: { sender: "vendor", at: (/* @__PURE__ */ new Date()).toISOString() } });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating typing status:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere skrive-status" });
    }
  });
  app2.post("/api/couples/conversations/:id/typing", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }
      await db.update(conversations).set({
        coupleTypingAt: /* @__PURE__ */ new Date()
      }).where(eq2(conversations.id, id));
      broadcastConversation(id, { type: "typing", payload: { sender: "couple", at: (/* @__PURE__ */ new Date()).toISOString() } });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating typing status:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere skrive-status" });
    }
  });
  app2.delete("/api/couples/messages/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [msg] = await db.select().from(messages).where(eq2(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, msg.conversationId));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne meldingen" });
      }
      await db.update(messages).set({ deletedByCouple: true, coupleDeletedAt: /* @__PURE__ */ new Date() }).where(eq2(messages.id, id));
      res.json({ success: true, message: "Melding slettet" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Kunne ikke slette melding" });
    }
  });
  app2.delete("/api/couples/conversations/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      await db.update(conversations).set({ deletedByCouple: true, coupleDeletedAt: /* @__PURE__ */ new Date() }).where(eq2(conversations.id, id));
      await db.update(messages).set({ deletedByCouple: true, coupleDeletedAt: /* @__PURE__ */ new Date() }).where(eq2(messages.conversationId, id));
      res.json({ success: true, message: "Samtale og meldinger slettet" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Kunne ikke slette samtale" });
    }
  });
  app2.delete("/api/vendor/messages/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [msg] = await db.select().from(messages).where(eq2(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, msg.conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne meldingen" });
      }
      await db.update(messages).set({ deletedByVendor: true, vendorDeletedAt: /* @__PURE__ */ new Date() }).where(eq2(messages.id, id));
      res.json({ success: true, message: "Melding slettet" });
    } catch (error) {
      console.error("Error deleting vendor message:", error);
      res.status(500).json({ error: "Kunne ikke slette melding" });
    }
  });
  app2.patch("/api/vendor/messages/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const { body } = req.body;
      if (!body || !body.trim()) {
        return res.status(400).json({ error: "Melding kan ikke v\xE6re tom" });
      }
      const [msg] = await db.select().from(messages).where(eq2(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }
      if (msg.senderType !== "vendor") {
        return res.status(403).json({ error: "Du kan kun redigere dine egne meldinger" });
      }
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, msg.conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne meldingen" });
      }
      const [updated] = await db.update(messages).set({
        body: body.trim(),
        editedAt: /* @__PURE__ */ new Date()
      }).where(eq2(messages.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error editing vendor message:", error);
      res.status(500).json({ error: "Kunne ikke redigere melding" });
    }
  });
  app2.delete("/api/vendor/conversations/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      await db.update(conversations).set({ deletedByVendor: true, vendorDeletedAt: /* @__PURE__ */ new Date() }).where(eq2(conversations.id, id));
      await db.update(messages).set({ deletedByVendor: true, vendorDeletedAt: /* @__PURE__ */ new Date() }).where(eq2(messages.conversationId, id));
      res.json({ success: true, message: "Samtale og meldinger slettet" });
    } catch (error) {
      console.error("Error deleting vendor conversation:", error);
      res.status(500).json({ error: "Kunne ikke slette samtale" });
    }
  });
  app2.post("/api/couples/conversations/from-inquiry", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { inquiryId } = req.body;
      const [inquiry] = await db.select().from(inspirationInquiries).where(eq2(inspirationInquiries.id, inquiryId));
      if (!inquiry) {
        return res.status(404).json({ error: "Henvendelse ikke funnet" });
      }
      let [existing] = await db.select().from(conversations).where(eq2(conversations.inquiryId, inquiryId));
      if (existing) {
        return res.json(existing);
      }
      const [conv] = await db.insert(conversations).values({
        coupleId,
        vendorId: inquiry.vendorId,
        inspirationId: inquiry.inspirationId,
        inquiryId,
        status: "active",
        lastMessageAt: /* @__PURE__ */ new Date()
      }).returning();
      await db.insert(messages).values({
        conversationId: conv.id,
        senderType: "couple",
        senderId: coupleId,
        body: inquiry.message
      });
      res.status(201).json(conv);
    } catch (error) {
      console.error("Error creating conversation from inquiry:", error);
      res.status(500).json({ error: "Kunne ikke opprette samtale" });
    }
  });
  app2.get("/api/reminders", async (req, res) => {
    try {
      const allReminders = await db.select().from(reminders).orderBy(reminders.reminderDate);
      res.json(allReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ error: "Kunne ikke hente p\xE5minnelser" });
    }
  });
  app2.post("/api/reminders", async (req, res) => {
    try {
      const validatedData = createReminderSchema.parse(req.body);
      const [newReminder] = await db.insert(reminders).values({
        title: validatedData.title,
        description: validatedData.description,
        reminderDate: new Date(validatedData.reminderDate),
        category: validatedData.category
      }).returning();
      res.status(201).json(newReminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ error: "Kunne ikke opprette p\xE5minnelse" });
    }
  });
  app2.patch("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isCompleted, notificationId } = req.body;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (isCompleted !== void 0) updates.isCompleted = isCompleted;
      if (notificationId !== void 0) updates.notificationId = notificationId;
      const [updated] = await db.update(reminders).set(updates).where(eq2(reminders.id, id)).returning();
      if (!updated) {
        return res.status(404).json({ error: "P\xE5minnelse ikke funnet" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere p\xE5minnelse" });
    }
  });
  app2.delete("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [deleted] = await db.delete(reminders).where(eq2(reminders.id, id)).returning();
      if (!deleted) {
        return res.status(404).json({ error: "P\xE5minnelse ikke funnet" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ error: "Kunne ikke slette p\xE5minnelse" });
    }
  });
  app2.get("/api/speeches", async (req, res) => {
    try {
      const coupleId = await checkCoupleAuth(req, res);
      const allSpeeches = await db.select().from(speeches).where(coupleId ? eq2(speeches.coupleId, coupleId) : sql3`1=1`).orderBy(speeches.sortOrder);
      res.json(allSpeeches);
    } catch (error) {
      console.error("Error fetching speeches:", error);
      res.status(500).json({ error: "Kunne ikke hente taleliste" });
    }
  });
  app2.post("/api/speeches", async (req, res) => {
    try {
      const coupleId = await checkCoupleAuth(req, res);
      const validatedData = createSpeechSchema.parse(req.body);
      const existingSpeeches = await db.select().from(speeches).where(coupleId ? eq2(speeches.coupleId, coupleId) : sql3`1=1`).orderBy(desc(speeches.sortOrder));
      const maxOrder = existingSpeeches.length > 0 ? existingSpeeches[0].sortOrder : 0;
      const [newSpeech] = await db.insert(speeches).values({
        coupleId: coupleId || void 0,
        speakerName: validatedData.speakerName,
        role: validatedData.role,
        durationMinutes: validatedData.durationMinutes,
        sortOrder: maxOrder + 1,
        notes: validatedData.notes,
        scheduledTime: validatedData.scheduledTime
      }).returning();
      if (coupleId) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
        const contracts = await db.select({
          vendorId: coupleVendorContracts.vendorId,
          notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges
        }).from(coupleVendorContracts).where(and2(
          eq2(coupleVendorContracts.coupleId, coupleId),
          eq2(coupleVendorContracts.status, "active")
        ));
        for (const contract of contracts) {
          if (contract.notifyOnSpeechChanges) {
            await db.insert(notifications).values({
              recipientType: "vendor",
              recipientId: contract.vendorId,
              type: "speech_changed",
              title: "Talelisteendring",
              body: `${couple?.displayName || "Brudeparet"} har lagt til en ny tale av "${validatedData.speakerName}".`,
              actorType: "couple",
              actorId: coupleId,
              actorName: couple?.displayName || "Brudeparet"
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
  app2.patch("/api/speeches/:id", async (req, res) => {
    try {
      const coupleId = await checkCoupleAuth(req, res);
      const { id } = req.params;
      const { speakerName, role, durationMinutes, sortOrder, notes, scheduledTime } = req.body;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (speakerName !== void 0) updates.speakerName = speakerName;
      if (role !== void 0) updates.role = role;
      if (durationMinutes !== void 0) updates.durationMinutes = durationMinutes;
      if (sortOrder !== void 0) updates.sortOrder = sortOrder;
      if (notes !== void 0) updates.notes = notes;
      if (scheduledTime !== void 0) updates.scheduledTime = scheduledTime;
      const [updated] = await db.update(speeches).set(updates).where(eq2(speeches.id, id)).returning();
      if (!updated) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }
      if (coupleId && updated.coupleId) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
        const contracts = await db.select({
          vendorId: coupleVendorContracts.vendorId,
          notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges
        }).from(coupleVendorContracts).where(and2(
          eq2(coupleVendorContracts.coupleId, coupleId),
          eq2(coupleVendorContracts.status, "active")
        ));
        for (const contract of contracts) {
          if (contract.notifyOnSpeechChanges) {
            await db.insert(notifications).values({
              recipientType: "vendor",
              recipientId: contract.vendorId,
              type: "speech_changed",
              title: "Talelisteendring",
              body: `${couple?.displayName || "Brudeparet"} har endret talen av "${updated.speakerName}".`,
              actorType: "couple",
              actorId: coupleId,
              actorName: couple?.displayName || "Brudeparet"
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
  app2.delete("/api/speeches/:id", async (req, res) => {
    try {
      const coupleId = await checkCoupleAuth(req, res);
      const { id } = req.params;
      const [speechToDelete] = await db.select().from(speeches).where(eq2(speeches.id, id));
      const [deleted] = await db.delete(speeches).where(eq2(speeches.id, id)).returning();
      if (!deleted) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }
      if (coupleId && speechToDelete?.coupleId) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
        const contracts = await db.select({
          vendorId: coupleVendorContracts.vendorId,
          notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges
        }).from(coupleVendorContracts).where(and2(
          eq2(coupleVendorContracts.coupleId, coupleId),
          eq2(coupleVendorContracts.status, "active")
        ));
        for (const contract of contracts) {
          if (contract.notifyOnSpeechChanges) {
            await db.insert(notifications).values({
              recipientType: "vendor",
              recipientId: contract.vendorId,
              type: "speech_changed",
              title: "Talelisteendring",
              body: `${couple?.displayName || "Brudeparet"} har fjernet talen av "${speechToDelete.speakerName}".`,
              actorType: "couple",
              actorId: coupleId,
              actorName: couple?.displayName || "Brudeparet"
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
  app2.post("/api/speeches/reorder", async (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: "orderedIds m\xE5 v\xE6re en liste" });
      }
      for (let i = 0; i < orderedIds.length; i++) {
        await db.update(speeches).set({ sortOrder: i, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(speeches.id, orderedIds[i]));
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering speeches:", error);
      res.status(500).json({ error: "Kunne ikke sortere taler" });
    }
  });
  app2.post("/api/conversations/:id/mark-read", async (req, res) => {
    try {
      const { id } = req.params;
      const { userType } = req.body;
      if (userType === "couple") {
        const coupleId = await checkCoupleAuth(req, res);
        if (!coupleId) return;
        await db.update(coupleProfiles).set({ lastActiveAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq2(coupleProfiles.id, coupleId));
        await db.update(messages).set({ readAt: /* @__PURE__ */ new Date() }).where(and2(
          eq2(messages.conversationId, id),
          eq2(messages.senderType, "vendor"),
          sql3`${messages.readAt} IS NULL`
        ));
        await db.update(conversations).set({ coupleUnreadCount: 0 }).where(eq2(conversations.id, id));
      } else if (userType === "vendor") {
        const vendorId = await checkVendorAuth2(req, res);
        if (!vendorId) return;
        await db.update(messages).set({ readAt: /* @__PURE__ */ new Date() }).where(and2(
          eq2(messages.conversationId, id),
          eq2(messages.senderType, "couple"),
          sql3`${messages.readAt} IS NULL`
        ));
        await db.update(conversations).set({ vendorUnreadCount: 0 }).where(eq2(conversations.id, id));
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      res.status(500).json({ error: "Kunne ikke markere som lest" });
    }
  });
  app2.get("/api/vendor/conversations/:id/details", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const [couple] = await db.select().from(coupleProfiles).where(eq2(coupleProfiles.id, conv.coupleId));
      const convMessages = await db.select().from(messages).where(eq2(messages.conversationId, id)).orderBy(messages.createdAt);
      const vendorMessages = convMessages.filter((m) => m.senderType === "vendor");
      const lastVendorMessage = vendorMessages[vendorMessages.length - 1];
      const messageSeenByCuple = lastVendorMessage?.readAt ? true : false;
      res.json({
        conversation: conv,
        couple: couple ? {
          id: couple.id,
          displayName: couple.displayName,
          email: couple.email,
          lastActiveAt: couple.lastActiveAt
        } : null,
        messages: convMessages,
        lastMessageSeenByCouple: messageSeenByCuple,
        lastSeenAt: lastVendorMessage?.readAt || null
      });
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      res.status(500).json({ error: "Kunne ikke hente samtaledetaljer" });
    }
  });
  app2.post("/api/vendor/conversations/:id/schedule-reminder", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const { reminderType, scheduledFor } = req.body;
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const [reminder] = await db.insert(messageReminders).values({
        conversationId: id,
        vendorId,
        coupleId: conv.coupleId,
        reminderType: reminderType || "gentle",
        scheduledFor: new Date(scheduledFor)
      }).returning();
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      res.status(500).json({ error: "Kunne ikke planlegge p\xE5minnelse" });
    }
  });
  app2.get("/api/vendor/message-reminders", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const pendingReminders = await db.select().from(messageReminders).where(and2(
        eq2(messageReminders.vendorId, vendorId),
        eq2(messageReminders.status, "pending")
      )).orderBy(messageReminders.scheduledFor);
      res.json(pendingReminders);
    } catch (error) {
      console.error("Error fetching message reminders:", error);
      res.status(500).json({ error: "Kunne ikke hente p\xE5minnelser" });
    }
  });
  app2.post("/api/admin/jobs/process-message-reminders", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const dueReminders = await db.select().from(messageReminders).where(and2(
        eq2(messageReminders.status, "pending"),
        sql3`${messageReminders.scheduledFor} <= NOW()`
      ));
      if (dueReminders.length === 0) {
        return res.json({ message: "Ingen p\xE5minnelser \xE5 behandle", sent: 0 });
      }
      let sent = 0;
      for (const reminder of dueReminders) {
        const [vendor] = await db.select({ businessName: vendors.businessName }).from(vendors).where(eq2(vendors.id, reminder.vendorId));
        const reminderText = reminder.reminderType === "final" ? "Siste p\xE5minnelse: " : "P\xE5minnelse: ";
        await db.insert(notifications).values({
          recipientType: "couple",
          recipientId: reminder.coupleId,
          type: "message_reminder",
          title: reminderText + "Ubesvart melding",
          body: `Du har en ubesvart melding fra ${vendor?.businessName}. Svar snart.`,
          relatedEntityType: "conversation",
          relatedEntityId: reminder.conversationId
        });
        await db.update(messageReminders).set({ status: "sent", sentAt: /* @__PURE__ */ new Date() }).where(eq2(messageReminders.id, reminder.id));
        sent++;
      }
      res.json({ message: `${sent} p\xE5minnelser sendt`, sent });
    } catch (error) {
      console.error("Error processing message reminders:", error);
      res.status(500).json({ error: "Kunne ikke behandle p\xE5minnelser" });
    }
  });
  app2.delete("/api/vendor/message-reminders/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [deleted] = await db.update(messageReminders).set({ status: "cancelled" }).where(and2(
        eq2(messageReminders.id, id),
        eq2(messageReminders.vendorId, vendorId)
      )).returning();
      if (!deleted) {
        return res.status(404).json({ error: "P\xE5minnelse ikke funnet" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error cancelling reminder:", error);
      res.status(500).json({ error: "Kunne ikke avbryte p\xE5minnelse" });
    }
  });
  app2.get("/api/vendor/products", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const products = await db.select().from(vendorProducts).where(and2(
        eq2(vendorProducts.vendorId, vendorId),
        eq2(vendorProducts.isArchived, false)
      )).orderBy(vendorProducts.sortOrder);
      res.json(products);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({ error: "Kunne ikke hente produkter" });
    }
  });
  app2.post("/api/vendor/products", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const validatedData = createVendorProductSchema.parse(req.body);
      const [product] = await db.insert(vendorProducts).values({
        vendorId,
        title: validatedData.title,
        description: validatedData.description,
        unitPrice: validatedData.unitPrice,
        unitType: validatedData.unitType,
        leadTimeDays: validatedData.leadTimeDays,
        minQuantity: validatedData.minQuantity,
        categoryTag: validatedData.categoryTag,
        imageUrl: validatedData.imageUrl || null,
        sortOrder: validatedData.sortOrder
      }).returning();
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating vendor product:", error);
      res.status(500).json({ error: "Kunne ikke opprette produkt" });
    }
  });
  app2.patch("/api/vendor/products/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const updates = req.body;
      const [existing] = await db.select().from(vendorProducts).where(and2(
        eq2(vendorProducts.id, id),
        eq2(vendorProducts.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Produkt ikke funnet" });
      }
      const [updated] = await db.update(vendorProducts).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(vendorProducts.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor product:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere produkt" });
    }
  });
  app2.delete("/api/vendor/products/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [archived] = await db.update(vendorProducts).set({ isArchived: true, updatedAt: /* @__PURE__ */ new Date() }).where(and2(
        eq2(vendorProducts.id, id),
        eq2(vendorProducts.vendorId, vendorId)
      )).returning();
      if (!archived) {
        return res.status(404).json({ error: "Produkt ikke funnet" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor product:", error);
      res.status(500).json({ error: "Kunne ikke slette produkt" });
    }
  });
  app2.get("/api/vendor/offers", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const offers = await db.select({
        offer: vendorOffers,
        couple: {
          id: coupleProfiles.id,
          displayName: coupleProfiles.displayName,
          email: coupleProfiles.email
        }
      }).from(vendorOffers).leftJoin(coupleProfiles, eq2(vendorOffers.coupleId, coupleProfiles.id)).where(eq2(vendorOffers.vendorId, vendorId)).orderBy(desc(vendorOffers.createdAt));
      const offersWithItems = await Promise.all(
        offers.map(async ({ offer, couple }) => {
          const items = await db.select().from(vendorOfferItems).where(eq2(vendorOfferItems.offerId, offer.id)).orderBy(vendorOfferItems.sortOrder);
          return { ...offer, couple, items };
        })
      );
      res.json(offersWithItems);
    } catch (error) {
      console.error("Error fetching vendor offers:", error);
      res.status(500).json({ error: "Kunne ikke hente tilbud" });
    }
  });
  app2.post("/api/vendor/offers", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const validatedData = createOfferSchema.parse(req.body);
      const totalAmount = validatedData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const [offer] = await db.insert(vendorOffers).values({
        vendorId,
        coupleId: validatedData.coupleId,
        conversationId: validatedData.conversationId || null,
        title: validatedData.title,
        message: validatedData.message,
        totalAmount,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null
      }).returning();
      const items = await Promise.all(
        validatedData.items.map(async (item, index) => {
          const [offerItem] = await db.insert(vendorOfferItems).values({
            offerId: offer.id,
            productId: item.productId || null,
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
            sortOrder: index
          }).returning();
          return offerItem;
        })
      );
      if (validatedData.conversationId) {
        await db.insert(messages).values({
          conversationId: validatedData.conversationId,
          senderType: "vendor",
          senderId: vendorId,
          body: `\u{1F4CB} Nytt tilbud: ${validatedData.title}
Totalt: ${(totalAmount / 100).toLocaleString("nb-NO")} kr`
        });
        await db.update(conversations).set({
          lastMessageAt: /* @__PURE__ */ new Date(),
          coupleUnreadCount: 1
        }).where(eq2(conversations.id, validatedData.conversationId));
      }
      res.status(201).json({ ...offer, items });
    } catch (error) {
      console.error("Error creating vendor offer:", error);
      res.status(500).json({ error: "Kunne ikke opprette tilbud" });
    }
  });
  app2.patch("/api/vendor/offers/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const updates = req.body;
      const [existing] = await db.select().from(vendorOffers).where(and2(
        eq2(vendorOffers.id, id),
        eq2(vendorOffers.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Tilbud ikke funnet" });
      }
      const [updated] = await db.update(vendorOffers).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(vendorOffers.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor offer:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tilbud" });
    }
  });
  app2.delete("/api/vendor/offers/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(vendorOffers).where(and2(
        eq2(vendorOffers.id, id),
        eq2(vendorOffers.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Tilbud ikke funnet" });
      }
      await db.delete(vendorOfferItems).where(eq2(vendorOfferItems.offerId, id));
      await db.delete(vendorOffers).where(eq2(vendorOffers.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor offer:", error);
      res.status(500).json({ error: "Kunne ikke slette tilbud" });
    }
  });
  app2.post("/api/couple/offers/:id/respond", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }
      let coupleId = COUPLE_SESSIONS.get(token)?.coupleId;
      if (!coupleId) {
        const [session] = await db.select().from(coupleSessions).where(eq2(coupleSessions.token, token));
        if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
          return res.status(401).json({ error: "Ugyldig \xF8kt" });
        }
        coupleId = session.coupleId;
        COUPLE_SESSIONS.set(token, { coupleId, expiresAt: session.expiresAt });
      }
      const { id } = req.params;
      const { response } = req.body;
      const [offer] = await db.select().from(vendorOffers).where(and2(
        eq2(vendorOffers.id, id),
        eq2(vendorOffers.coupleId, coupleId)
      ));
      if (!offer) {
        return res.status(404).json({ error: "Tilbud ikke funnet" });
      }
      if (offer.status !== "pending") {
        return res.status(400).json({ error: "Tilbudet er allerede behandlet" });
      }
      const updates = {
        status: response === "accept" ? "accepted" : "declined",
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (response === "accept") {
        updates.acceptedAt = /* @__PURE__ */ new Date();
      } else {
        updates.declinedAt = /* @__PURE__ */ new Date();
      }
      const [updated] = await db.update(vendorOffers).set(updates).where(eq2(vendorOffers.id, id)).returning();
      if (offer.conversationId) {
        const statusText = response === "accept" ? "akseptert" : "avsl\xE5tt";
        await db.insert(messages).values({
          conversationId: offer.conversationId,
          senderType: "couple",
          senderId: coupleId,
          body: `\u2705 Tilbud "${offer.title}" er ${statusText}`
        });
        await db.update(conversations).set({
          lastMessageAt: /* @__PURE__ */ new Date(),
          vendorUnreadCount: 1
        }).where(eq2(conversations.id, offer.conversationId));
      }
      res.json(updated);
    } catch (error) {
      console.error("Error responding to offer:", error);
      res.status(500).json({ error: "Kunne ikke svare p\xE5 tilbud" });
    }
  });
  app2.get("/api/couple/offers", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }
      let coupleId = COUPLE_SESSIONS.get(token)?.coupleId;
      if (!coupleId) {
        const [session] = await db.select().from(coupleSessions).where(eq2(coupleSessions.token, token));
        if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
          return res.status(401).json({ error: "Ugyldig \xF8kt" });
        }
        coupleId = session.coupleId;
        COUPLE_SESSIONS.set(token, { coupleId, expiresAt: session.expiresAt });
      }
      const offers = await db.select({
        offer: vendorOffers,
        vendor: {
          id: vendors.id,
          businessName: vendors.businessName,
          imageUrl: vendors.imageUrl
        }
      }).from(vendorOffers).leftJoin(vendors, eq2(vendorOffers.vendorId, vendors.id)).where(eq2(vendorOffers.coupleId, coupleId)).orderBy(desc(vendorOffers.createdAt));
      const offersWithItems = await Promise.all(
        offers.map(async ({ offer, vendor }) => {
          const items = await db.select().from(vendorOfferItems).where(eq2(vendorOfferItems.offerId, offer.id)).orderBy(vendorOfferItems.sortOrder);
          return { ...offer, vendor, items };
        })
      );
      res.json(offersWithItems);
    } catch (error) {
      console.error("Error fetching couple offers:", error);
      res.status(500).json({ error: "Kunne ikke hente tilbud" });
    }
  });
  app2.get("/api/vendor/contacts", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }
      const session = VENDOR_SESSIONS.get(token);
      if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
        return res.status(401).json({ error: "Ugyldig \xF8kt" });
      }
      const vendorConversations = await db.select({
        couple: {
          id: coupleProfiles.id,
          displayName: coupleProfiles.displayName,
          email: coupleProfiles.email,
          weddingDate: coupleProfiles.weddingDate
        },
        conversationId: conversations.id
      }).from(conversations).leftJoin(coupleProfiles, eq2(conversations.coupleId, coupleProfiles.id)).where(and2(
        eq2(conversations.vendorId, session.vendorId),
        eq2(conversations.status, "active"),
        eq2(conversations.deletedByVendor, false)
      ));
      const uniqueCouples = Array.from(
        new Map(vendorConversations.map((c) => [c.couple?.id, c])).values()
      );
      res.json(uniqueCouples);
    } catch (error) {
      console.error("Error fetching vendor contacts:", error);
      res.status(500).json({ error: "Kunne ikke hente kontakter" });
    }
  });
  app2.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await db.select().from(appSettings);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Kunne ikke hente innstillinger" });
    }
  });
  app2.put("/api/admin/settings", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { settings: settingsArray } = req.body;
      for (const setting of settingsArray) {
        const existing = await db.select().from(appSettings).where(eq2(appSettings.key, setting.key));
        if (existing.length > 0) {
          await db.update(appSettings).set({ value: setting.value, category: setting.category, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(appSettings.key, setting.key));
        } else {
          await db.insert(appSettings).values({
            key: setting.key,
            value: setting.value,
            category: setting.category
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
  app2.get("/api/admin/statistics", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const [vendorCount] = await db.select({ count: sql3`count(*)` }).from(vendors);
      const [approvedVendors] = await db.select({ count: sql3`count(*)` }).from(vendors).where(eq2(vendors.status, "approved"));
      const [pendingVendors] = await db.select({ count: sql3`count(*)` }).from(vendors).where(eq2(vendors.status, "pending"));
      const [coupleCount] = await db.select({ count: sql3`count(*)` }).from(coupleProfiles);
      const [inspirationCount] = await db.select({ count: sql3`count(*)` }).from(inspirations);
      const [pendingInspirations] = await db.select({ count: sql3`count(*)` }).from(inspirations).where(eq2(inspirations.status, "pending"));
      const [conversationCount] = await db.select({ count: sql3`count(*)` }).from(conversations);
      const [messageCount] = await db.select({ count: sql3`count(*)` }).from(messages);
      const [deliveryCount] = await db.select({ count: sql3`count(*)` }).from(deliveries);
      const [offerCount] = await db.select({ count: sql3`count(*)` }).from(vendorOffers);
      res.json({
        vendors: {
          total: Number(vendorCount?.count || 0),
          approved: Number(approvedVendors?.count || 0),
          pending: Number(pendingVendors?.count || 0)
        },
        couples: Number(coupleCount?.count || 0),
        inspirations: {
          total: Number(inspirationCount?.count || 0),
          pending: Number(pendingInspirations?.count || 0)
        },
        conversations: Number(conversationCount?.count || 0),
        messages: Number(messageCount?.count || 0),
        deliveries: Number(deliveryCount?.count || 0),
        offers: Number(offerCount?.count || 0)
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Kunne ikke hente statistikk" });
    }
  });
  app2.post("/api/admin/jobs/expire-offers", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const expiredOffers = await db.select().from(vendorOffers).where(and2(
        eq2(vendorOffers.status, "pending"),
        sql3`${vendorOffers.validUntil} < NOW()`
      ));
      if (expiredOffers.length === 0) {
        return res.json({ message: "Ingen utl\xF8pte tilbud", updated: 0 });
      }
      await db.update(vendorOffers).set({ status: "expired", updatedAt: /* @__PURE__ */ new Date() }).where(and2(
        eq2(vendorOffers.status, "pending"),
        sql3`${vendorOffers.validUntil} < NOW()`
      ));
      for (const offer of expiredOffers) {
        const [vendor] = await db.select({ businessName: vendors.businessName }).from(vendors).where(eq2(vendors.id, offer.vendorId));
        await db.insert(notifications).values({
          recipientType: "couple",
          recipientId: offer.coupleId,
          type: "offer_expired",
          title: "Tilbud utl\xF8pt",
          body: `Tilbudet fra ${vendor?.businessName} "${offer.title}" har utl\xF8pt`,
          relatedEntityType: "offer",
          relatedEntityId: offer.id
        });
      }
      res.json({ message: `${expiredOffers.length} tilbud marked som utl\xF8pt`, updated: expiredOffers.length });
    } catch (error) {
      console.error("Error expiring offers:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tilbud" });
    }
  });
  app2.post("/api/admin/inspiration-categories", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { name, icon, sortOrder } = req.body;
      const [newCategory] = await db.insert(inspirationCategories).values({
        name,
        icon,
        sortOrder: sortOrder || 0
      }).returning();
      res.json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Kunne ikke opprette kategori" });
    }
  });
  app2.put("/api/admin/inspiration-categories/:id", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { name, icon, sortOrder } = req.body;
      await db.update(inspirationCategories).set({ name, icon, sortOrder }).where(eq2(inspirationCategories.id, id));
      res.json({ message: "Kategori oppdatert" });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategori" });
    }
  });
  app2.delete("/api/admin/inspiration-categories/:id", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.delete(inspirationCategories).where(eq2(inspirationCategories.id, id));
      res.json({ message: "Kategori slettet" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Kunne ikke slette kategori" });
    }
  });
  app2.post("/api/admin/vendor-categories", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { name, icon, description } = req.body;
      const [newCategory] = await db.insert(vendorCategories).values({
        name,
        icon,
        description: description || null
      }).returning();
      res.json(newCategory);
    } catch (error) {
      console.error("Error creating vendor category:", error);
      res.status(500).json({ error: "Kunne ikke opprette kategori" });
    }
  });
  app2.put("/api/admin/vendor-categories/:id", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { name, icon, description } = req.body;
      await db.update(vendorCategories).set({ name, icon, description }).where(eq2(vendorCategories.id, id));
      res.json({ message: "Kategori oppdatert" });
    } catch (error) {
      console.error("Error updating vendor category:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategori" });
    }
  });
  app2.delete("/api/admin/vendor-categories/:id", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.delete(vendorCategories).where(eq2(vendorCategories.id, id));
      res.json({ message: "Kategori slettet" });
    } catch (error) {
      console.error("Error deleting vendor category:", error);
      res.status(500).json({ error: "Kunne ikke slette kategori" });
    }
  });
  app2.get("/api/admin/couples", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const couples = await db.select().from(coupleProfiles).orderBy(desc(coupleProfiles.createdAt));
      res.json(couples);
    } catch (error) {
      console.error("Error fetching couples:", error);
      res.status(500).json({ error: "Kunne ikke hente par" });
    }
  });
  app2.delete("/api/admin/couples/:id", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.delete(coupleSessions).where(eq2(coupleSessions.coupleId, id));
      await db.delete(messages).where(sql3`conversation_id IN (SELECT id FROM conversations WHERE couple_id = ${id})`);
      await db.delete(conversations).where(eq2(conversations.coupleId, id));
      await db.delete(coupleProfiles).where(eq2(coupleProfiles.id, id));
      res.json({ message: "Par slettet" });
    } catch (error) {
      console.error("Error deleting couple:", error);
      res.status(500).json({ error: "Kunne ikke slette par" });
    }
  });
  app2.put("/api/admin/vendors/:id", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { businessName, email, description, location, phone, website, priceRange, categoryId, status } = req.body;
      await db.update(vendors).set({
        businessName,
        email,
        description,
        location,
        phone,
        website,
        priceRange,
        categoryId,
        status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(vendors.id, id));
      res.json({ message: "Leverand\xF8r oppdatert" });
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere leverand\xF8r" });
    }
  });
  app2.delete("/api/admin/vendors/:id", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.delete(vendorFeatures).where(eq2(vendorFeatures.vendorId, id));
      await db.delete(vendorInspirationCategories).where(eq2(vendorInspirationCategories.vendorId, id));
      await db.delete(deliveryItems).where(sql3`delivery_id IN (SELECT id FROM deliveries WHERE vendor_id = ${id})`);
      await db.delete(deliveries).where(eq2(deliveries.vendorId, id));
      await db.delete(inspirationMedia).where(sql3`inspiration_id IN (SELECT id FROM inspirations WHERE vendor_id = ${id})`);
      await db.delete(inspirations).where(eq2(inspirations.vendorId, id));
      await db.delete(messages).where(sql3`conversation_id IN (SELECT id FROM conversations WHERE vendor_id = ${id})`);
      await db.delete(conversations).where(eq2(conversations.vendorId, id));
      await db.delete(vendorOfferItems).where(sql3`offer_id IN (SELECT id FROM vendor_offers WHERE vendor_id = ${id})`);
      await db.delete(vendorOffers).where(eq2(vendorOffers.vendorId, id));
      await db.delete(vendorProducts).where(eq2(vendorProducts.vendorId, id));
      await db.delete(vendors).where(eq2(vendors.id, id));
      res.json({ message: "Leverand\xF8r slettet" });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ error: "Kunne ikke slette leverand\xF8r" });
    }
  });
  app2.get("/api/couple/coordinators", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const invitations = await db.select().from(coordinatorInvitations).where(eq2(coordinatorInvitations.coupleId, coupleId)).orderBy(desc(coordinatorInvitations.createdAt));
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      res.status(500).json({ error: "Kunne ikke hente koordinatorer" });
    }
  });
  app2.post("/api/couple/coordinators", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { name, email, roleLabel, canViewSpeeches, canViewSchedule, expiresAt } = req.body;
      const accessToken = crypto2.randomBytes(32).toString("hex");
      const accessCode = Math.random().toString().slice(2, 8);
      const [invitation] = await db.insert(coordinatorInvitations).values({
        coupleId,
        name,
        email: email || null,
        roleLabel: roleLabel || "Toastmaster",
        accessToken,
        accessCode,
        canViewSpeeches: canViewSpeeches !== false,
        canViewSchedule: canViewSchedule !== false,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }).returning();
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating coordinator invitation:", error);
      res.status(500).json({ error: "Kunne ikke opprette invitasjon" });
    }
  });
  app2.patch("/api/couple/coordinators/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { name, roleLabel, canViewSpeeches, canViewSchedule, status } = req.body;
      const [updated] = await db.update(coordinatorInvitations).set({
        name,
        roleLabel,
        canViewSpeeches,
        canViewSchedule,
        status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and2(
        eq2(coordinatorInvitations.id, id),
        eq2(coordinatorInvitations.coupleId, coupleId)
      )).returning();
      if (!updated) {
        return res.status(404).json({ error: "Invitasjon ikke funnet" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating coordinator:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere invitasjon" });
    }
  });
  app2.delete("/api/couple/coordinators/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coordinatorInvitations).where(and2(
        eq2(coordinatorInvitations.id, id),
        eq2(coordinatorInvitations.coupleId, coupleId)
      ));
      res.json({ message: "Invitasjon slettet" });
    } catch (error) {
      console.error("Error deleting coordinator:", error);
      res.status(500).json({ error: "Kunne ikke slette invitasjon" });
    }
  });
  app2.get("/api/couple/guest-invitations", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : `http://localhost:${process.env.PORT || 5e3}`;
      const invitations = await db.select().from(guestInvitations).where(eq2(guestInvitations.coupleId, coupleId)).orderBy(desc(guestInvitations.createdAt));
      res.json(
        invitations.map((inv) => ({
          ...inv,
          inviteUrl: `${domain}/invite/${inv.inviteToken}`
        }))
      );
    } catch (error) {
      console.error("Error fetching guest invitations:", error);
      res.status(500).json({ error: "Kunne ikke hente invitasjoner" });
    }
  });
  app2.post("/api/couple/guest-invitations", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    const parsed = createGuestInvitationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const { name, email, phone, template, message, expiresAt } = parsed.data;
    try {
      const inviteToken = crypto2.randomBytes(24).toString("hex");
      const [invitation] = await db.insert(guestInvitations).values({
        coupleId,
        name,
        email: email || null,
        phone: phone || null,
        template,
        message: message || null,
        inviteToken,
        status: "sent",
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }).returning();
      const domain = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : `http://localhost:${process.env.PORT || 5e3}`;
      res.status(201).json({
        ...invitation,
        inviteUrl: `${domain}/invite/${inviteToken}`
      });
    } catch (error) {
      console.error("Error creating guest invitation:", error);
      res.status(500).json({ error: "Kunne ikke opprette invitasjon" });
    }
  });
  app2.patch("/api/couple/guest-invitations/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    const { id } = req.params;
    const { status, template, message, expiresAt } = req.body;
    try {
      const [updated] = await db.update(guestInvitations).set({
        status,
        template,
        message,
        expiresAt: expiresAt ? new Date(expiresAt) : void 0,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and2(eq2(guestInvitations.id, id), eq2(guestInvitations.coupleId, coupleId))).returning();
      if (!updated) return res.status(404).json({ error: "Invitasjon ikke funnet" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating guest invitation:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere invitasjon" });
    }
  });
  app2.delete("/api/couple/guest-invitations/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    const { id } = req.params;
    try {
      await db.delete(guestInvitations).where(and2(eq2(guestInvitations.id, id), eq2(guestInvitations.coupleId, coupleId)));
      res.json({ message: "Invitasjon slettet" });
    } catch (error) {
      console.error("Error deleting guest invitation:", error);
      res.status(500).json({ error: "Kunne ikke slette invitasjon" });
    }
  });
  app2.get("/api/guest/invite/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const [invitation] = await db.select({
        invite: guestInvitations,
        coupleName: coupleProfiles.displayName
      }).from(guestInvitations).leftJoin(coupleProfiles, eq2(guestInvitations.coupleId, coupleProfiles.id)).where(eq2(guestInvitations.inviteToken, token));
      if (!invitation?.invite) {
        return res.status(404).json({ error: "Ugyldig invitasjon" });
      }
      const expires = invitation.invite.expiresAt ? new Date(invitation.invite.expiresAt) : null;
      if (expires && expires < /* @__PURE__ */ new Date()) {
        return res.status(410).json({ error: "Invitasjonen er utl\xF8pt" });
      }
      res.json({
        ...invitation.invite,
        coupleName: invitation.coupleName
      });
    } catch (error) {
      console.error("Error fetching guest invitation:", error);
      res.status(500).json({ error: "Kunne ikke hente invitasjon" });
    }
  });
  app2.post("/api/guest/invite/:token/respond", async (req, res) => {
    try {
      const { token } = req.params;
      const { attending, dietary, allergies, notes, plusOne } = req.body;
      const [existing] = await db.select().from(guestInvitations).where(eq2(guestInvitations.inviteToken, token));
      if (!existing) {
        return res.status(404).json({ error: "Ugyldig invitasjon" });
      }
      const expires = existing.expiresAt ? new Date(existing.expiresAt) : null;
      if (expires && expires < /* @__PURE__ */ new Date()) {
        return res.status(410).json({ error: "Invitasjonen er utl\xF8pt" });
      }
      const [updated] = await db.update(guestInvitations).set({
        responseAttending: attending,
        responseDietary: dietary || null,
        responseAllergies: allergies || null,
        responseNotes: notes || null,
        responsePlusOne: plusOne || null,
        status: attending === false ? "declined" : "responded",
        respondedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(guestInvitations.id, existing.id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error responding to invitation:", error);
      res.status(500).json({ error: "Kunne ikke lagre svar" });
    }
  });
  app2.get("/invite/:token", async (req, res) => {
    const { token } = req.params;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const apiBase = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : `http://localhost:${process.env.PORT || 5e3}`;
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
        <input id="allergies" placeholder="N\xF8tter, gluten, laktose, osv" />
      </div>
      <div>
        <label>Plus-one navn</label>
        <input id="plusOne" placeholder="Navn p\xE5 f\xF8lge (valgfritt)" />
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
  app2.get("/api/coordinator/access/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const [invitation] = await db.select().from(coordinatorInvitations).where(and2(
        eq2(coordinatorInvitations.accessToken, token),
        eq2(coordinatorInvitations.status, "active")
      ));
      if (!invitation) {
        return res.status(404).json({ error: "Ugyldig eller utl\xF8pt tilgang" });
      }
      if (invitation.expiresAt && new Date(invitation.expiresAt) < /* @__PURE__ */ new Date()) {
        await db.update(coordinatorInvitations).set({ status: "expired" }).where(eq2(coordinatorInvitations.id, invitation.id));
        return res.status(403).json({ error: "Tilgangen har utl\xF8pt" });
      }
      await db.update(coordinatorInvitations).set({ lastAccessedAt: /* @__PURE__ */ new Date() }).where(eq2(coordinatorInvitations.id, invitation.id));
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
        weddingDate: coupleProfiles.weddingDate
      }).from(coupleProfiles).where(eq2(coupleProfiles.id, invitation.coupleId));
      let speechList = [];
      if (invitation.canViewSpeeches) {
        speechList = await db.select().from(speeches).where(eq2(speeches.coupleId, invitation.coupleId)).orderBy(speeches.sortOrder);
      }
      let scheduleList = [];
      if (invitation.canViewSchedule) {
        scheduleList = await db.select().from(scheduleEvents).where(eq2(scheduleEvents.coupleId, invitation.coupleId)).orderBy(scheduleEvents.time);
      }
      res.json({
        invitation: {
          id: invitation.id,
          name: invitation.name,
          roleLabel: invitation.roleLabel,
          canViewSpeeches: invitation.canViewSpeeches,
          canViewSchedule: invitation.canViewSchedule,
          canEditSpeeches: invitation.canEditSpeeches,
          canEditSchedule: invitation.canEditSchedule
        },
        couple,
        speeches: speechList,
        schedule: scheduleList
      });
    } catch (error) {
      console.error("Error accessing coordinator view:", error);
      res.status(500).json({ error: "Kunne ikke hente data" });
    }
  });
  app2.post("/api/coordinator/access-by-code", async (req, res) => {
    try {
      const { code } = req.body;
      const [invitation] = await db.select().from(coordinatorInvitations).where(and2(
        eq2(coordinatorInvitations.accessCode, code),
        eq2(coordinatorInvitations.status, "active")
      ));
      if (!invitation) {
        return res.status(404).json({ error: "Ugyldig kode" });
      }
      res.json({ token: invitation.accessToken });
    } catch (error) {
      console.error("Error validating access code:", error);
      res.status(500).json({ error: "Kunne ikke validere kode" });
    }
  });
  app2.get("/api/couple/schedule-events", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const events = await db.select().from(scheduleEvents).where(eq2(scheduleEvents.coupleId, coupleId)).orderBy(scheduleEvents.time);
      res.json(events);
    } catch (error) {
      console.error("Error fetching schedule events:", error);
      res.status(500).json({ error: "Kunne ikke hente program" });
    }
  });
  async function notifyVendorsOfChangeInternal(coupleId, changeType, actorName, description) {
    try {
      const contracts = await db.select({
        vendorId: coupleVendorContracts.vendorId,
        notifyOnScheduleChanges: coupleVendorContracts.notifyOnScheduleChanges,
        notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges
      }).from(coupleVendorContracts).where(and2(
        eq2(coupleVendorContracts.coupleId, coupleId),
        eq2(coupleVendorContracts.status, "active")
      ));
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName
      }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      for (const contract of contracts) {
        const shouldNotify = changeType === "schedule" ? contract.notifyOnScheduleChanges : contract.notifyOnSpeechChanges;
        if (shouldNotify) {
          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: contract.vendorId,
            type: changeType === "schedule" ? "schedule_changed" : "speech_changed",
            title: changeType === "schedule" ? "Programendring" : "Talelisteendring",
            body: `${actorName} har endret ${changeType === "schedule" ? "bryllupsprogrammet" : "talelisten"} for ${couple?.displayName || "brudeparet"}. ${description}`,
            actorType: "couple",
            actorId: coupleId,
            actorName
          });
        }
      }
    } catch (error) {
      console.error("Error notifying vendors:", error);
    }
  }
  app2.post("/api/couple/schedule-events", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { time, title, icon, notes, sortOrder } = req.body;
      const [event] = await db.insert(scheduleEvents).values({
        coupleId,
        time,
        title,
        icon: icon || "star",
        notes,
        sortOrder: sortOrder || 0
      }).returning();
      const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      await notifyVendorsOfChangeInternal(coupleId, "schedule", couple?.displayName || "Brudeparet", `"${title}" ble lagt til kl. ${time}.`);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating schedule event:", error);
      res.status(500).json({ error: "Kunne ikke opprette hendelse" });
    }
  });
  app2.patch("/api/couple/schedule-events/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { time, title, icon, notes, sortOrder } = req.body;
      const [updated] = await db.update(scheduleEvents).set({
        time,
        title,
        icon,
        notes,
        sortOrder,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and2(
        eq2(scheduleEvents.id, id),
        eq2(scheduleEvents.coupleId, coupleId)
      )).returning();
      if (!updated) {
        return res.status(404).json({ error: "Hendelse ikke funnet" });
      }
      const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      await notifyVendorsOfChangeInternal(coupleId, "schedule", couple?.displayName || "Brudeparet", `"${title}" ble endret.`);
      res.json(updated);
    } catch (error) {
      console.error("Error updating schedule event:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere hendelse" });
    }
  });
  app2.delete("/api/couple/schedule-events/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [event] = await db.select().from(scheduleEvents).where(and2(
        eq2(scheduleEvents.id, id),
        eq2(scheduleEvents.coupleId, coupleId)
      ));
      await db.delete(scheduleEvents).where(and2(
        eq2(scheduleEvents.id, id),
        eq2(scheduleEvents.coupleId, coupleId)
      ));
      if (event) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
        await notifyVendorsOfChangeInternal(coupleId, "schedule", couple?.displayName || "Brudeparet", `"${event.title}" ble fjernet.`);
      }
      res.json({ message: "Hendelse slettet" });
    } catch (error) {
      console.error("Error deleting schedule event:", error);
      res.status(500).json({ error: "Kunne ikke slette hendelse" });
    }
  });
  async function checkCoordinatorAuth(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Ikke autorisert" });
      return null;
    }
    const token = authHeader.replace("Bearer ", "");
    const [invite] = await db.select().from(coordinatorInvitations).where(and2(eq2(coordinatorInvitations.accessToken, token), eq2(coordinatorInvitations.status, "active")));
    if (!invite) {
      res.status(401).json({ error: "Ugyldig eller inaktiv tilgang" });
      return null;
    }
    await db.update(coordinatorInvitations).set({ lastAccessedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq2(coordinatorInvitations.id, invite.id));
    return invite.coupleId;
  }
  app2.get("/api/coordinator/schedule-events", async (req, res) => {
    const coupleId = await checkCoordinatorAuth(req, res);
    if (!coupleId) return;
    try {
      const events = await db.select({ id: scheduleEvents.id, time: scheduleEvents.time, title: scheduleEvents.title, icon: scheduleEvents.icon }).from(scheduleEvents).where(eq2(scheduleEvents.coupleId, coupleId)).orderBy(scheduleEvents.time);
      res.json(events);
    } catch (error) {
      console.error("Error fetching coordinator schedule:", error);
      res.status(500).json({ error: "Kunne ikke hente program" });
    }
  });
  app2.get("/api/coordinator/couple-profile", async (req, res) => {
    const coupleId = await checkCoordinatorAuth(req, res);
    if (!coupleId) return;
    try {
      const [couple] = await db.select({ id: coupleProfiles.id, displayName: coupleProfiles.displayName, weddingDate: coupleProfiles.weddingDate }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      if (!couple) return res.status(404).json({ error: "Profil ikke funnet" });
      res.json(couple);
    } catch (error) {
      console.error("Error fetching coordinator couple profile:", error);
      res.status(500).json({ error: "Kunne ikke hente profil" });
    }
  });
  app2.get("/api/couple/guests", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const guests = await db.select().from(weddingGuests).where(eq2(weddingGuests.coupleId, coupleId)).orderBy(weddingGuests.createdAt);
      res.json(guests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      res.status(500).json({ error: "Kunne ikke hente gjester" });
    }
  });
  app2.post("/api/couple/guests", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const parsed = insertWeddingGuestSchema.parse(req.body);
      const [guest] = await db.insert(weddingGuests).values({ ...parsed, coupleId }).returning();
      res.json(guest);
    } catch (error) {
      console.error("Error creating guest:", error);
      res.status(400).json({ error: "Kunne ikke opprett gjest" });
    }
  });
  app2.patch("/api/couple/guests/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const parsed = updateWeddingGuestSchema.parse(req.body);
      const [guest] = await db.select().from(weddingGuests).where(
        and2(
          eq2(weddingGuests.id, id),
          eq2(weddingGuests.coupleId, coupleId)
        )
      );
      if (!guest) {
        return res.status(404).json({ error: "Gjest ikke funnet" });
      }
      const [updated] = await db.update(weddingGuests).set({ ...parsed, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(weddingGuests.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating guest:", error);
      res.status(400).json({ error: "Kunne ikke oppdatere gjest" });
    }
  });
  app2.delete("/api/couple/guests/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [guest] = await db.select().from(weddingGuests).where(
        and2(
          eq2(weddingGuests.id, id),
          eq2(weddingGuests.coupleId, coupleId)
        )
      );
      if (!guest) {
        return res.status(404).json({ error: "Gjest ikke funnet" });
      }
      await db.delete(weddingGuests).where(eq2(weddingGuests.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting guest:", error);
      res.status(400).json({ error: "Kunne ikke slette gjest" });
    }
  });
  app2.get("/api/couple/tables", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const tables = await db.select().from(weddingTables).where(eq2(weddingTables.coupleId, coupleId)).orderBy(weddingTables.sortOrder);
      const assignments = await db.select().from(tableGuestAssignments).where(eq2(tableGuestAssignments.coupleId, coupleId));
      const guestsByTable = {};
      for (const a of assignments) {
        if (!guestsByTable[a.tableId]) guestsByTable[a.tableId] = [];
        guestsByTable[a.tableId].push(a.guestId);
      }
      const tablesWithGuests = tables.map((t) => ({
        ...t,
        guests: guestsByTable[t.id] || []
      }));
      res.json(tablesWithGuests);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ error: "Kunne ikke hente bord" });
    }
  });
  app2.post("/api/couple/tables", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { tableNumber, name, category, label, seats, isReserved, notes, vendorNotes, sortOrder } = req.body;
      const [table] = await db.insert(weddingTables).values({
        coupleId,
        tableNumber: tableNumber || 1,
        name: name || `Bord ${tableNumber || 1}`,
        category,
        label,
        seats: seats || 8,
        isReserved: isReserved || false,
        notes,
        vendorNotes,
        sortOrder: sortOrder || 0
      }).returning();
      res.status(201).json({ ...table, guests: [] });
    } catch (error) {
      console.error("Error creating table:", error);
      res.status(500).json({ error: "Kunne ikke opprette bord" });
    }
  });
  app2.patch("/api/couple/tables/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { tableNumber, name, category, label, seats, isReserved, notes, vendorNotes, sortOrder } = req.body;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (tableNumber !== void 0) updates.tableNumber = tableNumber;
      if (name !== void 0) updates.name = name;
      if (category !== void 0) updates.category = category;
      if (label !== void 0) updates.label = label;
      if (seats !== void 0) updates.seats = seats;
      if (isReserved !== void 0) updates.isReserved = isReserved;
      if (notes !== void 0) updates.notes = notes;
      if (vendorNotes !== void 0) updates.vendorNotes = vendorNotes;
      if (sortOrder !== void 0) updates.sortOrder = sortOrder;
      const [updated] = await db.update(weddingTables).set(updates).where(and2(
        eq2(weddingTables.id, id),
        eq2(weddingTables.coupleId, coupleId)
      )).returning();
      if (!updated) {
        return res.status(404).json({ error: "Bord ikke funnet" });
      }
      const contracts = await db.select({
        vendorId: coupleVendorContracts.vendorId,
        notifyOnTableChanges: coupleVendorContracts.notifyOnTableChanges
      }).from(coupleVendorContracts).where(and2(
        eq2(coupleVendorContracts.coupleId, coupleId),
        eq2(coupleVendorContracts.status, "active"),
        eq2(coupleVendorContracts.canViewTableSeating, true)
      ));
      const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      for (const contract of contracts) {
        if (contract.notifyOnTableChanges) {
          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: contract.vendorId,
            type: "table_changed",
            title: "Bordplassering endret",
            body: `${couple?.displayName || "Brudeparet"} har endret "${updated.name}".`,
            actorType: "couple",
            actorId: coupleId,
            actorName: couple?.displayName || "Brudeparet"
          });
        }
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating table:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere bord" });
    }
  });
  app2.delete("/api/couple/tables/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(tableGuestAssignments).where(and2(
        eq2(tableGuestAssignments.tableId, id),
        eq2(tableGuestAssignments.coupleId, coupleId)
      ));
      await db.delete(weddingTables).where(and2(
        eq2(weddingTables.id, id),
        eq2(weddingTables.coupleId, coupleId)
      ));
      res.json({ message: "Bord slettet" });
    } catch (error) {
      console.error("Error deleting table:", error);
      res.status(500).json({ error: "Kunne ikke slette bord" });
    }
  });
  app2.post("/api/couple/tables/:tableId/guests", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { tableId } = req.params;
      const { guestId, seatNumber } = req.body;
      await db.delete(tableGuestAssignments).where(and2(
        eq2(tableGuestAssignments.coupleId, coupleId),
        eq2(tableGuestAssignments.guestId, guestId)
      ));
      await db.insert(tableGuestAssignments).values({
        coupleId,
        tableId,
        guestId,
        seatNumber
      });
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error assigning guest:", error);
      res.status(500).json({ error: "Kunne ikke plassere gjest" });
    }
  });
  app2.delete("/api/couple/tables/:tableId/guests/:guestId", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { tableId, guestId } = req.params;
      await db.delete(tableGuestAssignments).where(and2(
        eq2(tableGuestAssignments.coupleId, coupleId),
        eq2(tableGuestAssignments.tableId, tableId),
        eq2(tableGuestAssignments.guestId, guestId)
      ));
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing guest:", error);
      res.status(500).json({ error: "Kunne ikke fjerne gjest" });
    }
  });
  app2.get("/api/vendor/couple/:coupleId/tables", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { coupleId } = req.params;
      const [contract] = await db.select().from(coupleVendorContracts).where(and2(
        eq2(coupleVendorContracts.vendorId, vendorId),
        eq2(coupleVendorContracts.coupleId, coupleId),
        eq2(coupleVendorContracts.status, "active"),
        eq2(coupleVendorContracts.canViewTableSeating, true)
      ));
      if (!contract) {
        return res.status(403).json({ error: "Ingen tilgang til bordplassering" });
      }
      const tables = await db.select().from(weddingTables).where(eq2(weddingTables.coupleId, coupleId)).orderBy(weddingTables.sortOrder);
      const assignments = await db.select().from(tableGuestAssignments).where(eq2(tableGuestAssignments.coupleId, coupleId));
      const guestsByTable = {};
      for (const a of assignments) {
        if (!guestsByTable[a.tableId]) guestsByTable[a.tableId] = [];
        guestsByTable[a.tableId].push(a.guestId);
      }
      const tablesWithGuests = tables.map((t) => ({
        ...t,
        guests: guestsByTable[t.id] || [],
        // Hide private notes, only show vendorNotes
        notes: void 0
      }));
      res.json(tablesWithGuests);
    } catch (error) {
      console.error("Error fetching tables for vendor:", error);
      res.status(500).json({ error: "Kunne ikke hente bordplassering" });
    }
  });
  async function validateCoordinatorAccess(token, requiredPermission) {
    const [invitation] = await db.select().from(coordinatorInvitations).where(and2(
      eq2(coordinatorInvitations.accessToken, token),
      eq2(coordinatorInvitations.status, "active")
    ));
    if (!invitation) return null;
    if (invitation.expiresAt && new Date(invitation.expiresAt) < /* @__PURE__ */ new Date()) {
      return null;
    }
    if (requiredPermission === "editSchedule" && !invitation.canEditSchedule) {
      return null;
    }
    if (requiredPermission === "editSpeeches" && !invitation.canEditSpeeches) {
      return null;
    }
    return invitation;
  }
  async function notifyVendorsOfChange(coupleId, changeType, actorName, description) {
    try {
      const contracts = await db.select({
        vendorId: coupleVendorContracts.vendorId,
        notifyOnScheduleChanges: coupleVendorContracts.notifyOnScheduleChanges,
        notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges
      }).from(coupleVendorContracts).where(and2(
        eq2(coupleVendorContracts.coupleId, coupleId),
        eq2(coupleVendorContracts.status, "active")
      ));
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName
      }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      for (const contract of contracts) {
        const shouldNotify = changeType === "schedule" ? contract.notifyOnScheduleChanges : contract.notifyOnSpeechChanges;
        if (shouldNotify) {
          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: contract.vendorId,
            type: changeType === "schedule" ? "schedule_changed" : "speech_changed",
            title: changeType === "schedule" ? "Programendring" : "Talelisteendring",
            body: `${actorName} har endret ${changeType === "schedule" ? "bryllupsprogrammet" : "talelisten"} for ${couple?.displayName || "brudeparet"}. ${description}`,
            actorType: "couple",
            actorId: coupleId,
            actorName
          });
        }
      }
    } catch (error) {
      console.error("Error notifying vendors:", error);
    }
  }
  app2.patch("/api/coordinator/:token/schedule-events/:id", async (req, res) => {
    try {
      const { token, id } = req.params;
      const invitation = await validateCoordinatorAccess(token, "editSchedule");
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til \xE5 redigere programmet" });
      }
      const { time, title, icon, notes } = req.body;
      const [previousEvent] = await db.select().from(scheduleEvents).where(and2(
        eq2(scheduleEvents.id, id),
        eq2(scheduleEvents.coupleId, invitation.coupleId)
      ));
      if (!previousEvent) {
        return res.status(404).json({ error: "Hendelse ikke funnet" });
      }
      const [updated] = await db.update(scheduleEvents).set({
        time,
        title,
        icon,
        notes,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and2(
        eq2(scheduleEvents.id, id),
        eq2(scheduleEvents.coupleId, invitation.coupleId)
      )).returning();
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "updated",
        entityType: "schedule_event",
        entityId: id,
        previousValue: JSON.stringify(previousEvent),
        newValue: JSON.stringify(updated)
      });
      await notifyVendorsOfChange(
        invitation.coupleId,
        "schedule",
        invitation.name,
        `"${title}" ble endret.`
      );
      res.json(updated);
    } catch (error) {
      console.error("Error updating schedule event:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere hendelse" });
    }
  });
  app2.post("/api/coordinator/:token/schedule-events", async (req, res) => {
    try {
      const { token } = req.params;
      const invitation = await validateCoordinatorAccess(token, "editSchedule");
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til \xE5 redigere programmet" });
      }
      const { time, title, icon, notes, sortOrder } = req.body;
      const [event] = await db.insert(scheduleEvents).values({
        coupleId: invitation.coupleId,
        time,
        title,
        icon: icon || "star",
        notes,
        sortOrder: sortOrder || 0
      }).returning();
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "created",
        entityType: "schedule_event",
        entityId: event.id,
        newValue: JSON.stringify(event)
      });
      await notifyVendorsOfChange(
        invitation.coupleId,
        "schedule",
        invitation.name,
        `"${title}" ble lagt til kl. ${time}.`
      );
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating schedule event:", error);
      res.status(500).json({ error: "Kunne ikke opprette hendelse" });
    }
  });
  app2.delete("/api/coordinator/:token/schedule-events/:id", async (req, res) => {
    try {
      const { token, id } = req.params;
      const invitation = await validateCoordinatorAccess(token, "editSchedule");
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til \xE5 redigere programmet" });
      }
      const [event] = await db.select().from(scheduleEvents).where(and2(
        eq2(scheduleEvents.id, id),
        eq2(scheduleEvents.coupleId, invitation.coupleId)
      ));
      if (!event) {
        return res.status(404).json({ error: "Hendelse ikke funnet" });
      }
      await db.delete(scheduleEvents).where(and2(
        eq2(scheduleEvents.id, id),
        eq2(scheduleEvents.coupleId, invitation.coupleId)
      ));
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "deleted",
        entityType: "schedule_event",
        entityId: id,
        previousValue: JSON.stringify(event)
      });
      await notifyVendorsOfChange(
        invitation.coupleId,
        "schedule",
        invitation.name,
        `"${event.title}" ble fjernet.`
      );
      res.json({ message: "Hendelse slettet" });
    } catch (error) {
      console.error("Error deleting schedule event:", error);
      res.status(500).json({ error: "Kunne ikke slette hendelse" });
    }
  });
  app2.patch("/api/coordinator/:token/speeches/:id", async (req, res) => {
    try {
      const { token, id } = req.params;
      const invitation = await validateCoordinatorAccess(token, "editSpeeches");
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til \xE5 redigere talelisten" });
      }
      const { speakerName, role, durationMinutes, notes, sortOrder, scheduledTime } = req.body;
      const [previousSpeech] = await db.select().from(speeches).where(and2(
        eq2(speeches.id, id),
        eq2(speeches.coupleId, invitation.coupleId)
      ));
      if (!previousSpeech) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }
      const [updated] = await db.update(speeches).set({
        speakerName,
        role,
        durationMinutes,
        notes,
        sortOrder,
        scheduledTime,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and2(
        eq2(speeches.id, id),
        eq2(speeches.coupleId, invitation.coupleId)
      )).returning();
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "updated",
        entityType: "speech",
        entityId: id,
        previousValue: JSON.stringify(previousSpeech),
        newValue: JSON.stringify(updated)
      });
      await notifyVendorsOfChange(
        invitation.coupleId,
        "speech",
        invitation.name,
        `Tale av "${speakerName}" ble endret.`
      );
      res.json(updated);
    } catch (error) {
      console.error("Error updating speech:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tale" });
    }
  });
  app2.post("/api/coordinator/:token/speeches", async (req, res) => {
    try {
      const { token } = req.params;
      const invitation = await validateCoordinatorAccess(token, "editSpeeches");
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til \xE5 redigere talelisten" });
      }
      const { speakerName, role, durationMinutes, notes, sortOrder, scheduledTime } = req.body;
      const [speech] = await db.insert(speeches).values({
        coupleId: invitation.coupleId,
        speakerName,
        role,
        durationMinutes: durationMinutes || 5,
        notes,
        sortOrder: sortOrder || 0,
        scheduledTime
      }).returning();
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "created",
        entityType: "speech",
        entityId: speech.id,
        newValue: JSON.stringify(speech)
      });
      await notifyVendorsOfChange(
        invitation.coupleId,
        "speech",
        invitation.name,
        `Tale av "${speakerName}" ble lagt til.`
      );
      res.status(201).json(speech);
    } catch (error) {
      console.error("Error creating speech:", error);
      res.status(500).json({ error: "Kunne ikke opprette tale" });
    }
  });
  app2.delete("/api/coordinator/:token/speeches/:id", async (req, res) => {
    try {
      const { token, id } = req.params;
      const invitation = await validateCoordinatorAccess(token, "editSpeeches");
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til \xE5 redigere talelisten" });
      }
      const [speech] = await db.select().from(speeches).where(and2(
        eq2(speeches.id, id),
        eq2(speeches.coupleId, invitation.coupleId)
      ));
      if (!speech) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }
      await db.delete(speeches).where(and2(
        eq2(speeches.id, id),
        eq2(speeches.coupleId, invitation.coupleId)
      ));
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "deleted",
        entityType: "speech",
        entityId: id,
        previousValue: JSON.stringify(speech)
      });
      await notifyVendorsOfChange(
        invitation.coupleId,
        "speech",
        invitation.name,
        `Tale av "${speech.speakerName}" ble fjernet.`
      );
      res.json({ message: "Tale slettet" });
    } catch (error) {
      console.error("Error deleting speech:", error);
      res.status(500).json({ error: "Kunne ikke slette tale" });
    }
  });
  app2.get("/api/couple/vendor-contracts", async (req, res) => {
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
        vendorCategory: vendorCategories.name
      }).from(coupleVendorContracts).leftJoin(vendors, eq2(coupleVendorContracts.vendorId, vendors.id)).leftJoin(vendorCategories, eq2(vendors.categoryId, vendorCategories.id)).where(eq2(coupleVendorContracts.coupleId, coupleId)).orderBy(desc(coupleVendorContracts.createdAt));
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching vendor contracts:", error);
      res.status(500).json({ error: "Kunne ikke hente leverand\xF8ravtaler" });
    }
  });
  app2.post("/api/couple/vendor-contracts", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { vendorId, offerId, vendorRole, notifyOnScheduleChanges, notifyOnSpeechChanges, canViewSchedule, canViewSpeeches } = req.body;
      const [existing] = await db.select().from(coupleVendorContracts).where(and2(
        eq2(coupleVendorContracts.coupleId, coupleId),
        eq2(coupleVendorContracts.vendorId, vendorId),
        eq2(coupleVendorContracts.status, "active")
      ));
      if (existing) {
        return res.status(400).json({ error: "Avtale eksisterer allerede" });
      }
      const [contract] = await db.insert(coupleVendorContracts).values({
        coupleId,
        vendorId,
        offerId,
        vendorRole,
        notifyOnScheduleChanges: notifyOnScheduleChanges ?? true,
        notifyOnSpeechChanges: notifyOnSpeechChanges ?? true,
        canViewSchedule: canViewSchedule ?? true,
        canViewSpeeches: canViewSpeeches ?? false
      }).returning();
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName
      }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      await db.insert(notifications).values({
        recipientType: "vendor",
        recipientId: vendorId,
        type: "contract_created",
        title: "Ny avtale",
        body: `${couple?.displayName || "Et brudepar"} har opprettet en avtale med deg.`,
        actorType: "couple",
        actorId: coupleId
      });
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating vendor contract:", error);
      res.status(500).json({ error: "Kunne ikke opprette avtale" });
    }
  });
  app2.patch("/api/couple/vendor-contracts/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { notifyOnScheduleChanges, notifyOnSpeechChanges, canViewSchedule, canViewSpeeches, status } = req.body;
      const [updated] = await db.update(coupleVendorContracts).set({
        notifyOnScheduleChanges,
        notifyOnSpeechChanges,
        canViewSchedule,
        canViewSpeeches,
        status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and2(
        eq2(coupleVendorContracts.id, id),
        eq2(coupleVendorContracts.coupleId, coupleId)
      )).returning();
      if (!updated) {
        return res.status(404).json({ error: "Avtale ikke funnet" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor contract:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere avtale" });
    }
  });
  app2.post("/api/couple/vendor-contracts/:id/complete", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [updated] = await db.update(coupleVendorContracts).set({
        status: "completed",
        completedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and2(
        eq2(coupleVendorContracts.id, id),
        eq2(coupleVendorContracts.coupleId, coupleId)
      )).returning();
      if (!updated) {
        return res.status(404).json({ error: "Avtale ikke funnet" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error completing vendor contract:", error);
      res.status(500).json({ error: "Kunne ikke fullf\xF8re avtale" });
    }
  });
  app2.get("/api/vendor/notifications", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const vendorNotifications = await db.select().from(notifications).where(and2(
        eq2(notifications.recipientType, "vendor"),
        eq2(notifications.recipientId, vendorId)
      )).orderBy(desc(notifications.createdAt)).limit(50);
      res.json(vendorNotifications);
    } catch (error) {
      console.error("Error fetching vendor notifications:", error);
      res.status(500).json({ error: "Kunne ikke hente varsler" });
    }
  });
  app2.patch("/api/vendor/notifications/:id/read", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      await db.update(notifications).set({ readAt: /* @__PURE__ */ new Date() }).where(and2(
        eq2(notifications.id, id),
        eq2(notifications.recipientId, vendorId)
      ));
      res.json({ message: "Varsel markert som lest" });
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere varsel" });
    }
  });
  app2.get("/api/couple/notifications", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const coupleNotifications = await db.select().from(notifications).where(and2(
        eq2(notifications.recipientType, "couple"),
        eq2(notifications.recipientId, coupleId)
      )).orderBy(desc(notifications.createdAt)).limit(50);
      res.json(coupleNotifications);
    } catch (error) {
      console.error("Error fetching couple notifications:", error);
      res.status(500).json({ error: "Kunne ikke hente varsler" });
    }
  });
  app2.get("/api/vendor/notifications/unread-count", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const [result] = await db.select({ count: sql3`count(*)::int` }).from(notifications).where(and2(
        eq2(notifications.recipientType, "vendor"),
        eq2(notifications.recipientId, vendorId),
        sql3`${notifications.readAt} IS NULL`
      ));
      res.json({ count: result?.count || 0 });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Kunne ikke hente antall uleste" });
    }
  });
  app2.get("/api/vendor/couple-schedule/:coupleId", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { coupleId } = req.params;
      const [contract] = await db.select().from(coupleVendorContracts).where(and2(
        eq2(coupleVendorContracts.coupleId, coupleId),
        eq2(coupleVendorContracts.vendorId, vendorId),
        eq2(coupleVendorContracts.status, "active"),
        eq2(coupleVendorContracts.canViewSchedule, true)
      ));
      if (!contract) {
        return res.status(403).json({ error: "Ingen tilgang til dette programmet" });
      }
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
        weddingDate: coupleProfiles.weddingDate
      }).from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      const schedule = await db.select().from(scheduleEvents).where(eq2(scheduleEvents.coupleId, coupleId)).orderBy(scheduleEvents.time);
      let speechList = [];
      if (contract.canViewSpeeches) {
        speechList = await db.select().from(speeches).where(eq2(speeches.coupleId, coupleId)).orderBy(speeches.sortOrder);
      }
      res.json({
        couple,
        schedule,
        speeches: speechList,
        canViewSpeeches: contract.canViewSpeeches
      });
    } catch (error) {
      console.error("Error fetching couple schedule for vendor:", error);
      res.status(500).json({ error: "Kunne ikke hente program" });
    }
  });
  app2.get("/api/couple/activity-log", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const logs = await db.select().from(activityLogs).where(eq2(activityLogs.coupleId, coupleId)).orderBy(desc(activityLogs.createdAt)).limit(50);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity log:", error);
      res.status(500).json({ error: "Kunne ikke hente aktivitetslogg" });
    }
  });
  app2.get("/api/couple/reviewable-contracts", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const contracts = await db.select({
        id: coupleVendorContracts.id,
        vendorId: coupleVendorContracts.vendorId,
        vendorRole: coupleVendorContracts.vendorRole,
        completedAt: coupleVendorContracts.completedAt,
        businessName: vendors.businessName,
        imageUrl: vendors.imageUrl
      }).from(coupleVendorContracts).innerJoin(vendors, eq2(coupleVendorContracts.vendorId, vendors.id)).where(and2(
        eq2(coupleVendorContracts.coupleId, coupleId),
        eq2(coupleVendorContracts.status, "completed")
      ));
      const existingReviews = await db.select({ contractId: vendorReviews.contractId }).from(vendorReviews).where(eq2(vendorReviews.coupleId, coupleId));
      const reviewedContractIds = new Set(existingReviews.map((r) => r.contractId));
      const result = contracts.map((c) => ({
        ...c,
        hasReview: reviewedContractIds.has(c.id)
      }));
      res.json(result);
    } catch (error) {
      console.error("Error fetching reviewable contracts:", error);
      res.status(500).json({ error: "Kunne ikke hente avsluttede avtaler" });
    }
  });
  app2.post("/api/couple/reviews", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { contractId, rating, title, body, isAnonymous } = req.body;
      if (!contractId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Ugyldig anmeldelse" });
      }
      const [contract] = await db.select().from(coupleVendorContracts).where(and2(
        eq2(coupleVendorContracts.id, contractId),
        eq2(coupleVendorContracts.coupleId, coupleId),
        eq2(coupleVendorContracts.status, "completed")
      ));
      if (!contract) {
        return res.status(404).json({ error: "Fant ikke fullf\xF8rt avtale" });
      }
      const [existing] = await db.select().from(vendorReviews).where(eq2(vendorReviews.contractId, contractId));
      if (existing) {
        return res.status(400).json({ error: "Du har allerede gitt en anmeldelse" });
      }
      const editableUntil = /* @__PURE__ */ new Date();
      editableUntil.setDate(editableUntil.getDate() + 14);
      const [review] = await db.insert(vendorReviews).values({
        contractId,
        coupleId,
        vendorId: contract.vendorId,
        rating,
        title: title || null,
        body: body || null,
        isAnonymous: isAnonymous || false,
        editableUntil
      }).returning();
      await db.insert(notifications).values({
        recipientType: "vendor",
        recipientId: contract.vendorId,
        type: "new_review",
        title: "Ny anmeldelse",
        body: `Du har mottatt en ${rating}-stjerners anmeldelse`,
        payload: JSON.stringify({ reviewId: review.id })
      });
      res.json(review);
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Kunne ikke lagre anmeldelse" });
    }
  });
  app2.patch("/api/couple/reviews/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { rating, title, body, isAnonymous } = req.body;
      const [existing] = await db.select().from(vendorReviews).where(and2(
        eq2(vendorReviews.id, id),
        eq2(vendorReviews.coupleId, coupleId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Fant ikke anmeldelse" });
      }
      if (existing.editableUntil && /* @__PURE__ */ new Date() > new Date(existing.editableUntil)) {
        return res.status(400).json({ error: "Redigeringsperioden har utl\xF8pt" });
      }
      const [updated] = await db.update(vendorReviews).set({
        rating: rating ?? existing.rating,
        title: title ?? existing.title,
        body: body ?? existing.body,
        isAnonymous: isAnonymous ?? existing.isAnonymous,
        isApproved: false,
        // Reset approval on edit
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(vendorReviews.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere anmeldelse" });
    }
  });
  app2.get("/api/couple/reviews", async (req, res) => {
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
        businessName: vendors.businessName
      }).from(vendorReviews).innerJoin(vendors, eq2(vendorReviews.vendorId, vendors.id)).where(eq2(vendorReviews.coupleId, coupleId)).orderBy(desc(vendorReviews.createdAt));
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching couple reviews:", error);
      res.status(500).json({ error: "Kunne ikke hente anmeldelser" });
    }
  });
  app2.get("/api/vendors/:vendorId/reviews", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const reviews = await db.select({
        id: vendorReviews.id,
        rating: vendorReviews.rating,
        title: vendorReviews.title,
        body: vendorReviews.body,
        isAnonymous: vendorReviews.isAnonymous,
        createdAt: vendorReviews.createdAt,
        coupleName: coupleProfiles.displayName
      }).from(vendorReviews).innerJoin(coupleProfiles, eq2(vendorReviews.coupleId, coupleProfiles.id)).where(and2(
        eq2(vendorReviews.vendorId, vendorId),
        eq2(vendorReviews.isApproved, true)
      )).orderBy(desc(vendorReviews.createdAt));
      const [vendor] = await db.select({ googleReviewUrl: vendors.googleReviewUrl }).from(vendors).where(eq2(vendors.id, vendorId));
      const [stats] = await db.select({
        count: sql3`count(*)::int`,
        average: sql3`round(avg(${vendorReviews.rating})::numeric, 1)`
      }).from(vendorReviews).where(and2(
        eq2(vendorReviews.vendorId, vendorId),
        eq2(vendorReviews.isApproved, true)
      ));
      const responses = await db.select().from(vendorReviewResponses).innerJoin(vendorReviews, eq2(vendorReviewResponses.reviewId, vendorReviews.id)).where(eq2(vendorReviews.vendorId, vendorId));
      const responseMap = new Map(responses.map((r) => [r.vendor_review_responses.reviewId, r.vendor_review_responses]));
      const reviewsWithResponses = reviews.map((r) => ({
        ...r,
        coupleName: r.isAnonymous ? "Anonym" : r.coupleName,
        vendorResponse: responseMap.get(r.id) || null
      }));
      res.json({
        reviews: reviewsWithResponses,
        googleReviewUrl: vendor?.googleReviewUrl || null,
        stats: {
          count: stats?.count || 0,
          average: stats?.average || 0
        }
      });
    } catch (error) {
      console.error("Error fetching vendor reviews:", error);
      res.status(500).json({ error: "Kunne ikke hente anmeldelser" });
    }
  });
  app2.get("/api/vendor/reviews", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
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
        coupleName: coupleProfiles.displayName
      }).from(vendorReviews).innerJoin(coupleProfiles, eq2(vendorReviews.coupleId, coupleProfiles.id)).where(eq2(vendorReviews.vendorId, vendorId)).orderBy(desc(vendorReviews.createdAt));
      const responses = await db.select().from(vendorReviewResponses).where(eq2(vendorReviewResponses.vendorId, vendorId));
      const responseMap = new Map(responses.map((r) => [r.reviewId, r]));
      const reviewsWithResponses = reviews.map((r) => ({
        ...r,
        coupleName: r.isAnonymous ? "Anonym" : r.coupleName,
        response: responseMap.get(r.id) || null
      }));
      const [stats] = await db.select({
        total: sql3`count(*)::int`,
        approved: sql3`count(*) filter (where ${vendorReviews.isApproved})::int`,
        average: sql3`round(avg(${vendorReviews.rating})::numeric, 1)`
      }).from(vendorReviews).where(eq2(vendorReviews.vendorId, vendorId));
      res.json({
        reviews: reviewsWithResponses,
        stats: {
          total: stats?.total || 0,
          approved: stats?.approved || 0,
          average: stats?.average || 0
        }
      });
    } catch (error) {
      console.error("Error fetching vendor reviews:", error);
      res.status(500).json({ error: "Kunne ikke hente anmeldelser" });
    }
  });
  app2.post("/api/vendor/reviews/:reviewId/response", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { reviewId } = req.params;
      const { body } = req.body;
      if (!body || body.trim().length === 0) {
        return res.status(400).json({ error: "Svar kan ikke v\xE6re tomt" });
      }
      const [review] = await db.select().from(vendorReviews).where(and2(
        eq2(vendorReviews.id, reviewId),
        eq2(vendorReviews.vendorId, vendorId)
      ));
      if (!review) {
        return res.status(404).json({ error: "Fant ikke anmeldelse" });
      }
      const [existing] = await db.select().from(vendorReviewResponses).where(eq2(vendorReviewResponses.reviewId, reviewId));
      if (existing) {
        const [updated] = await db.update(vendorReviewResponses).set({ body, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(vendorReviewResponses.reviewId, reviewId)).returning();
        res.json(updated);
      } else {
        const [response] = await db.insert(vendorReviewResponses).values({
          reviewId,
          vendorId,
          body
        }).returning();
        res.json(response);
      }
    } catch (error) {
      console.error("Error responding to review:", error);
      res.status(500).json({ error: "Kunne ikke lagre svar" });
    }
  });
  app2.get("/api/vendor/contracts", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const contracts = await db.select({
        id: coupleVendorContracts.id,
        coupleId: coupleVendorContracts.coupleId,
        status: coupleVendorContracts.status,
        completedAt: coupleVendorContracts.completedAt,
        reviewReminderSentAt: coupleVendorContracts.reviewReminderSentAt,
        coupleName: coupleProfiles.displayName
      }).from(coupleVendorContracts).innerJoin(coupleProfiles, eq2(coupleVendorContracts.coupleId, coupleProfiles.id)).where(eq2(coupleVendorContracts.vendorId, vendorId)).orderBy(desc(coupleVendorContracts.createdAt));
      const contractIds = contracts.map((c) => c.id);
      const reviews = contractIds.length > 0 ? await db.select({ contractId: vendorReviews.contractId }).from(vendorReviews).where(inArray(vendorReviews.contractId, contractIds)) : [];
      const reviewedContractIds = new Set(reviews.map((r) => r.contractId));
      const contractsWithReviewStatus = contracts.map((c) => ({
        ...c,
        hasReview: reviewedContractIds.has(c.id)
      }));
      res.json(contractsWithReviewStatus);
    } catch (error) {
      console.error("Error fetching vendor contracts:", error);
      res.status(500).json({ error: "Kunne ikke hente avtaler" });
    }
  });
  app2.post("/api/vendor/contracts/:contractId/review-reminder", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { contractId } = req.params;
      const [contract] = await db.select().from(coupleVendorContracts).where(and2(
        eq2(coupleVendorContracts.id, contractId),
        eq2(coupleVendorContracts.vendorId, vendorId),
        eq2(coupleVendorContracts.status, "completed")
      ));
      if (!contract) {
        return res.status(404).json({ error: "Fant ikke fullf\xF8rt avtale" });
      }
      if (contract.reviewReminderSentAt) {
        const daysSinceReminder = Math.floor(
          (Date.now() - new Date(contract.reviewReminderSentAt).getTime()) / (1e3 * 60 * 60 * 24)
        );
        if (daysSinceReminder < 14) {
          return res.status(400).json({
            error: `Du kan sende ny p\xE5minnelse om ${14 - daysSinceReminder} dager`
          });
        }
      }
      const [existingReview] = await db.select().from(vendorReviews).where(eq2(vendorReviews.contractId, contractId));
      if (existingReview) {
        return res.status(400).json({ error: "Brudeparet har allerede gitt anmeldelse" });
      }
      const [vendor] = await db.select({ businessName: vendors.businessName }).from(vendors).where(eq2(vendors.id, vendorId));
      await db.insert(notifications).values({
        recipientType: "couple",
        recipientId: contract.coupleId,
        type: "review_reminder",
        title: "Gi en anmeldelse",
        body: `${vendor?.businessName} \xF8nsker gjerne din tilbakemelding p\xE5 tjenesten`,
        payload: JSON.stringify({ contractId, vendorId })
      });
      await db.update(coupleVendorContracts).set({ reviewReminderSentAt: /* @__PURE__ */ new Date() }).where(eq2(coupleVendorContracts.id, contractId));
      res.json({ success: true, message: "P\xE5minnelse sendt" });
    } catch (error) {
      console.error("Error sending review reminder:", error);
      res.status(500).json({ error: "Kunne ikke sende p\xE5minnelse" });
    }
  });
  app2.patch("/api/vendor/google-review-url", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { googleReviewUrl } = req.body;
      if (googleReviewUrl && !googleReviewUrl.includes("google.com")) {
        return res.status(400).json({ error: "Ugyldig Google-lenke" });
      }
      await db.update(vendors).set({ googleReviewUrl: googleReviewUrl || null, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(vendors.id, vendorId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating Google review URL:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere lenke" });
    }
  });
  app2.post("/api/couple/feedback", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { category, subject, message } = req.body;
      if (!category || !subject || !message) {
        return res.status(400).json({ error: "Alle felt m\xE5 fylles ut" });
      }
      const [feedback] = await db.insert(appFeedback).values({
        submitterType: "couple",
        submitterId: coupleId,
        category,
        subject,
        message
      }).returning();
      res.json(feedback);
    } catch (error) {
      console.error("Error submitting couple feedback:", error);
      res.status(500).json({ error: "Kunne ikke sende tilbakemelding" });
    }
  });
  app2.post("/api/vendor/feedback", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { category, subject, message } = req.body;
      if (!category || !subject || !message) {
        return res.status(400).json({ error: "Alle felt m\xE5 fylles ut" });
      }
      const [feedback] = await db.insert(appFeedback).values({
        submitterType: "vendor",
        submitterId: vendorId,
        category,
        subject,
        message
      }).returning();
      res.json(feedback);
    } catch (error) {
      console.error("Error submitting vendor feedback:", error);
      res.status(500).json({ error: "Kunne ikke sende tilbakemelding" });
    }
  });
  app2.get("/api/admin/feedback", async (req, res) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const feedback = await db.select().from(appFeedback).orderBy(desc(appFeedback.createdAt));
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Kunne ikke hente tilbakemeldinger" });
    }
  });
  app2.patch("/api/admin/feedback/:id", async (req, res) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const [updated] = await db.update(appFeedback).set({ status, adminNotes, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(appFeedback.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tilbakemelding" });
    }
  });
  app2.patch("/api/admin/reviews/:id", async (req, res) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { id } = req.params;
      const { isApproved } = req.body;
      const [updated] = await db.update(vendorReviews).set({
        isApproved,
        approvedAt: isApproved ? /* @__PURE__ */ new Date() : null,
        approvedBy: isApproved ? "admin" : null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(vendorReviews.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating review approval:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere godkjenning" });
    }
  });
  app2.get("/api/admin/reviews/pending", async (req, res) => {
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
        businessName: vendors.businessName
      }).from(vendorReviews).innerJoin(coupleProfiles, eq2(vendorReviews.coupleId, coupleProfiles.id)).innerJoin(vendors, eq2(vendorReviews.vendorId, vendors.id)).where(eq2(vendorReviews.isApproved, false)).orderBy(vendorReviews.createdAt);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ error: "Kunne ikke hente ventende anmeldelser" });
    }
  });
  app2.patch("/api/vendor/contracts/:id/complete", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [contract] = await db.select().from(coupleVendorContracts).where(and2(
        eq2(coupleVendorContracts.id, id),
        eq2(coupleVendorContracts.vendorId, vendorId)
      ));
      if (!contract) {
        return res.status(404).json({ error: "Fant ikke avtale" });
      }
      const [updated] = await db.update(coupleVendorContracts).set({
        status: "completed",
        completedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(coupleVendorContracts.id, id)).returning();
      const [vendor] = await db.select({ businessName: vendors.businessName }).from(vendors).where(eq2(vendors.id, vendorId));
      await db.insert(notifications).values({
        recipientType: "couple",
        recipientId: contract.coupleId,
        type: "contract_completed",
        title: "Avtale fullf\xF8rt",
        body: `${vendor?.businessName} har markert avtalen som fullf\xF8rt. Gi gjerne en anmeldelse!`,
        payload: JSON.stringify({ contractId: id, vendorId })
      });
      res.json(updated);
    } catch (error) {
      console.error("Error completing contract:", error);
      res.status(500).json({ error: "Kunne ikke fullf\xF8re avtale" });
    }
  });
  app2.get("/api/admin/checklists", async (req, res) => {
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
        weddingDate: coupleProfiles.weddingDate
      }).from(checklistTasks).innerJoin(coupleProfiles, eq2(checklistTasks.coupleId, coupleProfiles.id)).orderBy(coupleProfiles.displayName, checklistTasks.sortOrder);
      res.json(checklists);
    } catch (error) {
      console.error("Error fetching admin checklists:", error);
      res.status(500).json({ error: "Kunne ikke hente sjekklister" });
    }
  });
  app2.get("/api/admin/checklists/:coupleId", async (req, res) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { coupleId } = req.params;
      const tasks = await db.select().from(checklistTasks).where(eq2(checklistTasks.coupleId, coupleId)).orderBy(checklistTasks.sortOrder, checklistTasks.monthsBefore);
      const [couple] = await db.select().from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      res.json({ couple, tasks });
    } catch (error) {
      console.error("Error fetching couple checklist:", error);
      res.status(500).json({ error: "Kunne ikke hente sjekkliste" });
    }
  });
  app2.patch("/api/admin/checklists/:id", async (req, res) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { id } = req.params;
      const { title, monthsBefore, category, completed, notes, assignedTo } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (title !== void 0) updateData.title = title;
      if (monthsBefore !== void 0) updateData.monthsBefore = monthsBefore;
      if (category !== void 0) updateData.category = category;
      if (notes !== void 0) updateData.notes = notes;
      if (assignedTo !== void 0) updateData.assignedTo = assignedTo;
      if (completed !== void 0) {
        updateData.completed = completed;
        if (completed) {
          updateData.completedAt = /* @__PURE__ */ new Date();
        } else {
          updateData.completedAt = null;
          updateData.completedBy = null;
        }
      }
      const [updated] = await db.update(checklistTasks).set(updateData).where(eq2(checklistTasks.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating checklist task (admin):", error);
      res.status(500).json({ error: "Kunne ikke oppdatere oppgave" });
    }
  });
  app2.delete("/api/admin/checklists/:id", async (req, res) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { id } = req.params;
      await db.delete(checklistTasks).where(eq2(checklistTasks.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting checklist task (admin):", error);
      res.status(500).json({ error: "Kunne ikke slette oppgave" });
    }
  });
  app2.get("/api/checklist", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const tasks = await db.select().from(checklistTasks).where(eq2(checklistTasks.coupleId, coupleId)).orderBy(checklistTasks.sortOrder, checklistTasks.monthsBefore);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching checklist:", error);
      res.status(500).json({ error: "Kunne ikke hente sjekkliste" });
    }
  });
  app2.post("/api/checklist", async (req, res) => {
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
        ...validation.data
      }).returning();
      res.json(task);
    } catch (error) {
      console.error("Error creating checklist task:", error);
      res.status(500).json({ error: "Kunne ikke opprette oppgave" });
    }
  });
  app2.patch("/api/checklist/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { title, monthsBefore, category, completed, notes, assignedTo, createReminder } = req.body;
      const [existing] = await db.select().from(checklistTasks).where(and2(
        eq2(checklistTasks.id, id),
        eq2(checklistTasks.coupleId, coupleId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Fant ikke oppgave" });
      }
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (title !== void 0) updateData.title = title;
      if (monthsBefore !== void 0) updateData.monthsBefore = monthsBefore;
      if (category !== void 0) updateData.category = category;
      if (notes !== void 0) updateData.notes = notes;
      if (assignedTo !== void 0) updateData.assignedTo = assignedTo;
      if (completed !== void 0) {
        updateData.completed = completed;
        if (completed) {
          updateData.completedAt = /* @__PURE__ */ new Date();
          updateData.completedBy = coupleId;
        } else {
          updateData.completedAt = null;
          updateData.completedBy = null;
        }
      }
      if (createReminder && monthsBefore !== void 0) {
        const [couple] = await db.select().from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
        if (couple?.weddingDate) {
          const weddingDate = new Date(couple.weddingDate);
          const reminderDate = new Date(weddingDate);
          reminderDate.setMonth(reminderDate.getMonth() - monthsBefore);
          const [reminder] = await db.insert(reminders).values({
            title: title || existing.title,
            description: notes || `Fra sjekkliste: ${title || existing.title}`,
            reminderDate,
            category: "planning"
          }).returning();
          updateData.linkedReminderId = reminder.id;
        }
      }
      const [updated] = await db.update(checklistTasks).set(updateData).where(eq2(checklistTasks.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating checklist task:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere oppgave" });
    }
  });
  app2.delete("/api/checklist/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(checklistTasks).where(and2(
        eq2(checklistTasks.id, id),
        eq2(checklistTasks.coupleId, coupleId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Fant ikke oppgave" });
      }
      if (existing.isDefault) {
        return res.status(400).json({ error: "Kan ikke slette standardoppgaver" });
      }
      await db.delete(checklistTasks).where(eq2(checklistTasks.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting checklist task:", error);
      res.status(500).json({ error: "Kunne ikke slette oppgave" });
    }
  });
  app2.post("/api/checklist/seed-defaults", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(checklistTasks).where(eq2(checklistTasks.coupleId, coupleId));
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
        { title: "Bestill/kj\xF8p brudekjole", monthsBefore: 9, category: "attire", sortOrder: 7 },
        { title: "Book DJ/band", monthsBefore: 8, category: "vendors", sortOrder: 8 },
        { title: "Velg catering/meny", monthsBefore: 6, category: "vendors", sortOrder: 9 },
        { title: "Send 'save the date'", monthsBefore: 6, category: "logistics", sortOrder: 10 },
        { title: "Bestill invitasjoner", monthsBefore: 5, category: "logistics", sortOrder: 11 },
        { title: "Book overnatting for gjester", monthsBefore: 5, category: "logistics", sortOrder: 12 },
        { title: "Velg blomsterarrangement", monthsBefore: 4, category: "vendors", sortOrder: 13 },
        { title: "Kj\xF8p/bestill gifteringer", monthsBefore: 4, category: "attire", sortOrder: 14 },
        { title: "Send invitasjoner", monthsBefore: 3, category: "logistics", sortOrder: 15 },
        { title: "Planlegg bryllupsreise", monthsBefore: 3, category: "logistics", sortOrder: 16 },
        { title: "Pr\xF8v brudekjole", monthsBefore: 2, category: "attire", sortOrder: 17 },
        { title: "Ferdigstill kj\xF8replan", monthsBefore: 2, category: "planning", sortOrder: 18 },
        { title: "Bekreft alle leverand\xF8rer", monthsBefore: 1, category: "vendors", sortOrder: 19 },
        { title: "Ferdigstill bordplassering", monthsBefore: 1, category: "logistics", sortOrder: 20 },
        { title: "Hent brudekjole", monthsBefore: 1, category: "attire", sortOrder: 21 },
        { title: "\xD8v p\xE5 brudevals", monthsBefore: 1, category: "final", sortOrder: 22 },
        { title: "Pakk til bryllupsreise", monthsBefore: 0, category: "final", sortOrder: 23 },
        { title: "Siste gjennomgang med lokale", monthsBefore: 0, category: "final", sortOrder: 24 }
      ];
      const tasks = await db.insert(checklistTasks).values(
        DEFAULT_TASKS.map((task) => ({
          coupleId,
          ...task,
          isDefault: true
        }))
      ).returning();
      res.json(tasks);
    } catch (error) {
      console.error("Error seeding checklist:", error);
      res.status(500).json({ error: "Kunne ikke opprette standardsjekkliste" });
    }
  });
  app2.get("/api/faq/:category", async (req, res) => {
    try {
      const { category } = req.params;
      if (category !== "couple" && category !== "vendor") {
        return res.status(400).json({ error: "Ugyldig kategori" });
      }
      const items = await db.select().from(faqItems).where(and2(
        eq2(faqItems.category, category),
        eq2(faqItems.isActive, true)
      )).orderBy(faqItems.sortOrder);
      res.json(items);
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      res.status(500).json({ error: "Kunne ikke hente FAQ" });
    }
  });
  app2.get("/api/admin/faq/:category", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { category } = req.params;
      if (category !== "couple" && category !== "vendor") {
        return res.status(400).json({ error: "Ugyldig kategori" });
      }
      const items = await db.select().from(faqItems).where(eq2(faqItems.category, category)).orderBy(faqItems.sortOrder);
      res.json(items);
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      res.status(500).json({ error: "Kunne ikke hente FAQ" });
    }
  });
  app2.post("/api/admin/faq", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const parsed = insertFaqItemSchema.parse(req.body);
      const [item] = await db.insert(faqItems).values(parsed).returning();
      res.json(item);
    } catch (error) {
      console.error("Error creating FAQ:", error);
      res.status(400).json({ error: error.message || "Kunne ikke opprette FAQ" });
    }
  });
  app2.patch("/api/admin/faq/:id", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { id } = req.params;
      const parsed = updateFaqItemSchema.parse(req.body);
      const [item] = await db.update(faqItems).set(parsed).where(eq2(faqItems.id, id)).returning();
      if (!item) {
        return res.status(404).json({ error: "FAQ ikke funnet" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere FAQ" });
    }
  });
  app2.delete("/api/admin/faq/:id", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { id } = req.params;
      await db.delete(faqItems).where(eq2(faqItems.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ error: "Kunne ikke slette FAQ" });
    }
  });
  app2.get("/api/app-settings", async (req, res) => {
    try {
      const settings = await db.select().from(appSettings);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
      res.status(500).json({ error: "Kunne ikke hente innstillinger" });
    }
  });
  app2.get("/api/app-settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const [setting] = await db.select().from(appSettings).where(eq2(appSettings.key, key));
      if (!setting) {
        return res.status(404).json({ error: "Innstilling ikke funnet" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching app setting:", error);
      res.status(500).json({ error: "Kunne ikke hente innstilling" });
    }
  });
  app2.get("/api/admin/app-settings", async (req, res) => {
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
  app2.patch("/api/admin/app-settings/:key", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { key } = req.params;
      const parsed = updateAppSettingSchema.parse(req.body);
      const [existing] = await db.select().from(appSettings).where(eq2(appSettings.key, key));
      let setting;
      if (existing) {
        [setting] = await db.update(appSettings).set({ value: parsed.value, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(appSettings.key, key)).returning();
      } else {
        [setting] = await db.insert(appSettings).values({ key, value: parsed.value }).returning();
      }
      res.json(setting);
    } catch (error) {
      console.error("Error updating app setting:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere innstilling" });
    }
  });
  app2.get("/api/whats-new/:category", async (req, res) => {
    try {
      const { category } = req.params;
      if (!["vendor", "couple"].includes(category)) {
        return res.status(400).json({ error: "Ugyldig kategori" });
      }
      const items = await db.select().from(whatsNewItems).where(and2(
        eq2(whatsNewItems.category, category),
        eq2(whatsNewItems.isActive, true)
      )).orderBy(whatsNewItems.sortOrder);
      res.json(items);
    } catch (error) {
      console.error("Error fetching what's new:", error);
      res.status(500).json({ error: "Kunne ikke hente hva som er nytt" });
    }
  });
  app2.get("/api/admin/whats-new/:category", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { category } = req.params;
      if (!["vendor", "couple"].includes(category)) {
        return res.status(400).json({ error: "Ugyldig kategori" });
      }
      const items = await db.select().from(whatsNewItems).where(eq2(whatsNewItems.category, category)).orderBy(whatsNewItems.sortOrder);
      res.json(items);
    } catch (error) {
      console.error("Error fetching what's new:", error);
      res.status(500).json({ error: "Kunne ikke hente hva som er nytt" });
    }
  });
  app2.post("/api/admin/whats-new", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const parsed = insertWhatsNewSchema.parse(req.body);
      const [item] = await db.insert(whatsNewItems).values(parsed).returning();
      res.json(item);
    } catch (error) {
      console.error("Error creating what's new:", error);
      res.status(400).json({ error: error.message || "Kunne ikke opprette hva som er nytt" });
    }
  });
  app2.patch("/api/admin/whats-new/:id", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { id } = req.params;
      const parsed = updateWhatsNewSchema.parse(req.body);
      const [item] = await db.update(whatsNewItems).set({ ...parsed, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(whatsNewItems.id, id)).returning();
      if (!item) {
        return res.status(404).json({ error: "Hva som er nytt ikke funnet" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating what's new:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere hva som er nytt" });
    }
  });
  app2.delete("/api/admin/whats-new/:id", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { id } = req.params;
      await db.delete(whatsNewItems).where(eq2(whatsNewItems.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting what's new:", error);
      res.status(500).json({ error: "Kunne ikke slette hva som er nytt" });
    }
  });
  app2.get("/api/video-guides/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const guides = await db.select().from(videoGuides).where(
        and2(
          eq2(videoGuides.category, category),
          eq2(videoGuides.isActive, true)
        )
      ).orderBy(videoGuides.sortOrder);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching video guides:", error);
      res.status(500).json({ error: "Kunne ikke hente videoguider" });
    }
  });
  app2.get("/api/admin/video-guides/:category", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { category } = req.params;
      const guides = await db.select().from(videoGuides).where(eq2(videoGuides.category, category)).orderBy(videoGuides.sortOrder);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching video guides:", error);
      res.status(500).json({ error: "Kunne ikke hente videoguider" });
    }
  });
  app2.post("/api/admin/video-guides", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const parsed = insertVideoGuideSchema.parse(req.body);
      const [guide] = await db.insert(videoGuides).values(parsed).returning();
      res.json(guide);
    } catch (error) {
      console.error("Error creating video guide:", error);
      res.status(400).json({ error: error.message || "Kunne ikke opprette videoguide" });
    }
  });
  app2.patch("/api/admin/video-guides/:id", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { id } = req.params;
      const parsed = updateVideoGuideSchema.parse(req.body);
      const [guide] = await db.update(videoGuides).set({ ...parsed, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(videoGuides.id, id)).returning();
      res.json(guide);
    } catch (error) {
      console.error("Error updating video guide:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere videoguide" });
    }
  });
  app2.delete("/api/admin/video-guides/:id", async (req, res) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;
    try {
      const { id } = req.params;
      await db.delete(videoGuides).where(eq2(videoGuides.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting video guide:", error);
      res.status(500).json({ error: "Kunne ikke slette videoguide" });
    }
  });
  const httpServer = createServer(app2);
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
        set = /* @__PURE__ */ new Set();
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
      try {
        ws.close();
      } catch {
      }
    }
  });
  const wssAdminVendorAdmin = new WebSocketServer({ server: httpServer, path: "/ws/admin/vendor-admin" });
  wssAdminVendorAdmin.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const adminKey = url.searchParams.get("adminKey") || "";
      const conversationId = url.searchParams.get("conversationId") || "";
      if (!process.env.ADMIN_SECRET || `Bearer ${process.env.ADMIN_SECRET}` !== `Bearer ${adminKey}`) {
        ws.close(1008, "unauthorized");
        return;
      }
      if (!conversationId) {
        ws.close(1008, "bad-request");
        return;
      }
      const [conv] = await db.select().from(adminConversations).where(eq2(adminConversations.id, conversationId));
      if (!conv) {
        ws.close(1008, "not-found");
        return;
      }
      let set = adminConvClients.get(conversationId);
      if (!set) {
        set = /* @__PURE__ */ new Set();
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
      try {
        ws.close();
      } catch {
      }
    }
  });
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
      try {
        ws.close();
      } catch {
      }
    }
  });
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
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, conversationId));
      if (!conv || conv.coupleId !== coupleId) {
        ws.close(1008, "forbidden");
        return;
      }
      let set = conversationClients.get(conversationId);
      if (!set) {
        set = /* @__PURE__ */ new Set();
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
      try {
        ws.close();
      } catch {
      }
    }
  });
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
      const [conv] = await db.select().from(conversations).where(eq2(conversations.id, conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        ws.close(1008, "forbidden");
        return;
      }
      let set = conversationClients.get(conversationId);
      if (!set) {
        set = /* @__PURE__ */ new Set();
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
      try {
        ws.close();
      } catch {
      }
    }
  });
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
        set = /* @__PURE__ */ new Set();
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
      try {
        ws.close();
      } catch {
      }
    }
  });
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
        set = /* @__PURE__ */ new Set();
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
      try {
        ws.close();
      } catch {
      }
    }
  });
  registerSubscriptionRoutes(app2);
  return httpServer;
}

// server/index.ts
import * as fs from "fs";
import * as path from "path";
import { config as config2 } from "dotenv";
config2({ path: ".env.local", override: true });
console.log("DATABASE_URL loaded:", process.env.DATABASE_URL ? "YES" : "NO");
console.log("ADMIN_SECRET loaded:", process.env.ADMIN_SECRET ? "YES" : "NO");
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origin = req.header("origin");
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    const isGitHubCodespaces = origin?.includes(".app.github.dev") || origin?.includes(".github.dev");
    const isCloudflare = origin?.includes(".trycloudflare.com");
    const isReplit = origin?.includes(".replit.dev") || origin?.includes(".repl.co");
    const isProductionDomain = origin === "https://wedflow.no" || origin?.includes(".vercel.app");
    const shouldAllowOrigin = isDev || isLocalhost || isGitHubCodespaces || isCloudflare || isReplit || isProductionDomain;
    if (origin && shouldAllowOrigin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, x-session-token, x-admin-secret, authorization, Authorization, Accept, Origin, X-Requested-With"
      );
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Max-Age", "86400");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
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
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
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
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, _next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  const server = await registerRoutes(app);
  configureExpoAndLanding(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
