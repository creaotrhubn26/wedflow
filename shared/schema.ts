import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const vendorCategories = pgTable("vendor_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description"),
});

export const vendors = pgTable("vendors", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  categoryId: varchar("category_id").references(() => vendorCategories.id),
  description: text("description"),
  location: text("location"),
  phone: text("phone"),
  website: text("website"),
  priceRange: text("price_range"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVendorCategorySchema = createInsertSchema(vendorCategories).pick({
  name: true,
  icon: true,
  description: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  status: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

export const vendorRegistrationSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Passord må være minst 8 tegn"),
  businessName: z.string().min(2, "Bedriftsnavn må være minst 2 tegn"),
  categoryId: z.string().min(1, "Velg en kategori"),
  description: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  priceRange: z.string().optional(),
});

export type InsertVendorCategory = z.infer<typeof insertVendorCategorySchema>;
export type VendorCategory = typeof vendorCategories.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type VendorRegistration = z.infer<typeof vendorRegistrationSchema>;

export const vendorFeatures = pgTable("vendor_features", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  featureKey: text("feature_key").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorInspirationCategories = pgTable("vendor_inspiration_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  categoryId: varchar("category_id").notNull().references(() => inspirationCategories.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export type VendorFeature = typeof vendorFeatures.$inferSelect;
export type VendorInspirationCategory = typeof vendorInspirationCategories.$inferSelect;

export const deliveries = pgTable("deliveries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  coupleName: text("couple_name").notNull(),
  coupleEmail: text("couple_email"),
  accessCode: text("access_code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  weddingDate: text("wedding_date"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deliveryItems = pgTable("delivery_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  deliveryId: varchar("delivery_id").notNull().references(() => deliveries.id),
  type: text("type").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  accessCode: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryItemSchema = createInsertSchema(deliveryItems).omit({
  id: true,
  createdAt: true,
});

export const createDeliverySchema = z.object({
  coupleName: z.string().min(2, "Navn må være minst 2 tegn"),
  coupleEmail: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  title: z.string().min(2, "Tittel må være minst 2 tegn"),
  description: z.string().optional(),
  weddingDate: z.string().optional(),
  items: z.array(z.object({
    type: z.enum(["gallery", "video", "website", "download", "other"]),
    label: z.string().min(1, "Etikett er påkrevd"),
    url: z.string().url("Ugyldig URL"),
    description: z.string().optional(),
  })).min(1, "Legg til minst én leveranse"),
});

export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertDeliveryItem = z.infer<typeof insertDeliveryItemSchema>;
export type DeliveryItem = typeof deliveryItems.$inferSelect;
export type CreateDelivery = z.infer<typeof createDeliverySchema>;

export const inspirationCategories = pgTable("inspiration_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const inspirations = pgTable("inspirations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  categoryId: varchar("category_id").references(() => inspirationCategories.id),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inspirationMedia = pgTable("inspiration_media", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  inspirationId: varchar("inspiration_id").notNull().references(() => inspirations.id),
  type: text("type").notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInspirationCategorySchema = createInsertSchema(inspirationCategories).omit({
  id: true,
});

export const insertInspirationSchema = createInsertSchema(inspirations).omit({
  id: true,
  status: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInspirationMediaSchema = createInsertSchema(inspirationMedia).omit({
  id: true,
  createdAt: true,
});

export const createInspirationSchema = z.object({
  categoryId: z.string().min(1, "Velg en kategori"),
  title: z.string().min(2, "Tittel må være minst 2 tegn"),
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
    caption: z.string().optional(),
  })).min(1, "Legg til minst ett bilde eller video"),
});

export const inspirationInquiries = pgTable("inspiration_inquiries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  inspirationId: varchar("inspiration_id").notNull().references(() => inspirations.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  weddingDate: text("wedding_date"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const createInquirySchema = z.object({
  inspirationId: z.string(),
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().optional(),
  message: z.string().min(10, "Melding må være minst 10 tegn"),
  weddingDate: z.string().optional(),
});

export type InsertInspirationCategory = z.infer<typeof insertInspirationCategorySchema>;
export type InspirationCategory = typeof inspirationCategories.$inferSelect;
export type InsertInspiration = z.infer<typeof insertInspirationSchema>;
export type Inspiration = typeof inspirations.$inferSelect;
export type InsertInspirationMedia = z.infer<typeof insertInspirationMediaSchema>;
export type InspirationMedia = typeof inspirationMedia.$inferSelect;
export type CreateInspiration = z.infer<typeof createInspirationSchema>;
export type InspirationInquiry = typeof inspirationInquiries.$inferSelect;
export type CreateInquiry = z.infer<typeof createInquirySchema>;

// Couple Profiles for messaging
export const coupleProfiles = pgTable("couple_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  partnerEmail: text("partner_email"),
  weddingDate: text("wedding_date"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleSessions = pgTable("couple_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations between couples and vendors
export const conversations = pgTable("conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  inspirationId: varchar("inspiration_id").references(() => inspirations.id),
  inquiryId: varchar("inquiry_id").references(() => inspirationInquiries.id),
  status: text("status").notNull().default("active"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  coupleUnreadCount: integer("couple_unread_count").default(0),
  vendorUnreadCount: integer("vendor_unread_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  deletedByCouple: boolean("deleted_by_couple").default(false),
  deletedByVendor: boolean("deleted_by_vendor").default(false),
  coupleDeletedAt: timestamp("couple_deleted_at"),
  vendorDeletedAt: timestamp("vendor_deleted_at"),
});

export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderType: text("sender_type").notNull(), // 'couple' or 'vendor'
  senderId: varchar("sender_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  deletedByCouple: boolean("deleted_by_couple").default(false),
  deletedByVendor: boolean("deleted_by_vendor").default(false),
  coupleDeletedAt: timestamp("couple_deleted_at"),
  vendorDeletedAt: timestamp("vendor_deleted_at"),
});

export const insertCoupleProfileSchema = createInsertSchema(coupleProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const coupleLoginSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  displayName: z.string().min(2, "Navn må være minst 2 tegn"),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  vendorId: z.string().optional(),
  inspirationId: z.string().optional(),
  body: z.string().min(1, "Melding kan ikke være tom"),
});

export type CoupleProfile = typeof coupleProfiles.$inferSelect;
export type CoupleSession = typeof coupleSessions.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type CoupleLogin = z.infer<typeof coupleLoginSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;

// Reminders for wedding planning tasks
export const reminders = pgTable("reminders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  reminderDate: timestamp("reminder_date").notNull(),
  category: text("category").notNull().default("general"),
  isCompleted: boolean("is_completed").default(false),
  notificationId: text("notification_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  isCompleted: true,
  notificationId: true,
  createdAt: true,
  updatedAt: true,
});

export const createReminderSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().optional(),
  reminderDate: z.string(),
  category: z.enum(["general", "vendor", "budget", "guest", "planning"]).default("general"),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type CreateReminder = z.infer<typeof createReminderSchema>;

// Vendor Products/Catalog
export const vendorProducts = pgTable("vendor_products", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  title: text("title").notNull(),
  description: text("description"),
  unitPrice: integer("unit_price").notNull(), // Price in øre (NOK cents)
  unitType: text("unit_type").notNull().default("stk"), // stk, time, dag, pakke, etc.
  leadTimeDays: integer("lead_time_days"),
  minQuantity: integer("min_quantity").default(1),
  categoryTag: text("category_tag"), // Internal categorization
  imageUrl: text("image_url"),
  isArchived: boolean("is_archived").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVendorProductSchema = createInsertSchema(vendorProducts).omit({
  id: true,
  isArchived: true,
  createdAt: true,
  updatedAt: true,
});

export const createVendorProductSchema = z.object({
  title: z.string().min(2, "Tittel må være minst 2 tegn"),
  description: z.string().optional(),
  unitPrice: z.number().min(0, "Pris må være 0 eller høyere"),
  unitType: z.string().default("stk"),
  leadTimeDays: z.number().min(0).optional(),
  minQuantity: z.number().min(1).default(1),
  categoryTag: z.string().optional(),
  imageUrl: z.string().url("Ugyldig URL").optional().or(z.literal("")),
  sortOrder: z.number().default(0),
});

export type VendorProduct = typeof vendorProducts.$inferSelect;
export type InsertVendorProduct = z.infer<typeof insertVendorProductSchema>;
export type CreateVendorProduct = z.infer<typeof createVendorProductSchema>;

// Vendor Offers to Couples
export const vendorOffers = pgTable("vendor_offers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  title: text("title").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, accepted, declined, expired
  totalAmount: integer("total_amount").notNull(), // In øre
  currency: text("currency").default("NOK"),
  validUntil: timestamp("valid_until"),
  acceptedAt: timestamp("accepted_at"),
  declinedAt: timestamp("declined_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorOfferItems = pgTable("vendor_offer_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => vendorOffers.id),
  productId: varchar("product_id").references(() => vendorProducts.id), // Optional - can be custom line
  title: text("title").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(), // In øre
  lineTotal: integer("line_total").notNull(), // quantity * unitPrice
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorOfferSchema = createInsertSchema(vendorOffers).omit({
  id: true,
  status: true,
  acceptedAt: true,
  declinedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorOfferItemSchema = createInsertSchema(vendorOfferItems).omit({
  id: true,
  createdAt: true,
});

export const createOfferSchema = z.object({
  coupleId: z.string().min(1, "Velg en mottaker"),
  conversationId: z.string().optional(),
  title: z.string().min(2, "Tittel må være minst 2 tegn"),
  message: z.string().optional(),
  validUntil: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().optional(),
    title: z.string().min(1, "Tittel er påkrevd"),
    description: z.string().optional(),
    quantity: z.number().min(1).default(1),
    unitPrice: z.number().min(0, "Pris må være 0 eller høyere"),
  })).min(1, "Legg til minst én linje"),
});

export type VendorOffer = typeof vendorOffers.$inferSelect;
export type VendorOfferItem = typeof vendorOfferItems.$inferSelect;
export type InsertVendorOffer = z.infer<typeof insertVendorOfferSchema>;
export type InsertVendorOfferItem = z.infer<typeof insertVendorOfferItemSchema>;
export type CreateOffer = z.infer<typeof createOfferSchema>;

// Speeches for wedding day schedule
export const speeches = pgTable("speeches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => coupleProfiles.id),
  speakerName: text("speaker_name").notNull(),
  role: text("role"), // brudgom, brud, forlovere, foreldre, etc.
  durationMinutes: integer("duration_minutes").notNull().default(5),
  sortOrder: integer("sort_order").notNull().default(0),
  notes: text("notes"),
  scheduledTime: text("scheduled_time"), // Optional specific time slot
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSpeechSchema = createInsertSchema(speeches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createSpeechSchema = z.object({
  speakerName: z.string().min(1, "Navn er påkrevd"),
  role: z.string().optional(),
  durationMinutes: z.number().min(1).max(60).default(5),
  sortOrder: z.number().default(0),
  notes: z.string().optional(),
  scheduledTime: z.string().optional(),
});

export type Speech = typeof speeches.$inferSelect;
export type InsertSpeech = z.infer<typeof insertSpeechSchema>;
export type CreateSpeech = z.infer<typeof createSpeechSchema>;

// Message reminders for anti-ghosting
export const messageReminders = pgTable("message_reminders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id),
  reminderType: text("reminder_type").notNull().default("gentle"), // gentle, deadline, final
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: text("status").notNull().default("pending"), // pending, sent, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export type MessageReminder = typeof messageReminders.$inferSelect;

// App Settings for admin customization
export const appSettings = pgTable("app_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull().default("general"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppSettingSchema = createInsertSchema(appSettings).omit({
  id: true,
  updatedAt: true,
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = z.infer<typeof insertAppSettingSchema>;
