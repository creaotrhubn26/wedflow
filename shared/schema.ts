import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date, index, uniqueIndex } from "drizzle-orm/pg-core";
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorSessions = pgTable("vendor_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  organizationNumber: z.string().optional(),
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
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  featureKey: text("feature_key").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorInspirationCategories = pgTable("vendor_inspiration_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => inspirationCategories.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export type VendorFeature = typeof vendorFeatures.$inferSelect;
export type VendorInspirationCategory = typeof vendorInspirationCategories.$inferSelect;

// Category-specific details per vendor (used for capacity matching, venue info, etc.)
export const vendorCategoryDetails = pgTable("vendor_category_details", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  venueCapacityMin: integer("venue_capacity_min"),
  venueCapacityMax: integer("venue_capacity_max"),
  cateringMinGuests: integer("catering_min_guests"),
  cateringMaxGuests: integer("catering_max_guests"),
  venueType: text("venue_type"),
  venueLocation: text("venue_location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type VendorCategoryDetails = typeof vendorCategoryDetails.$inferSelect;

export const deliveries = pgTable("deliveries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
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
  deliveryId: varchar("delivery_id").notNull().references(() => deliveries.id, { onDelete: "cascade" }),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inspirationMedia = pgTable("inspiration_media", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  inspirationId: varchar("inspiration_id").notNull().references(() => inspirations.id, { onDelete: "cascade" }),
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
  inspirationId: varchar("inspiration_id").notNull().references(() => inspirations.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
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

// Checklist Tasks - Wedding planning checklist with server sync
export const checklistTasks = pgTable("checklist_tasks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  monthsBefore: integer("months_before").notNull().default(12),
  category: text("category").notNull().default("planning"), // planning, vendors, attire, logistics, final
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by"), // coupleId who completed it
  assignedTo: varchar("assigned_to"), // Optional: assign to partner
  notes: text("notes"),
  linkedReminderId: varchar("linked_reminder_id").references(() => reminders.id),
  isDefault: boolean("is_default").notNull().default(false), // True for system-generated tasks
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChecklistTaskSchema = createInsertSchema(checklistTasks).omit({
  id: true,
  completedAt: true,
  completedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const createChecklistTaskSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  monthsBefore: z.number().min(0).max(24).default(12),
  category: z.enum(["planning", "vendors", "attire", "logistics", "final"]).default("planning"),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

export type ChecklistTask = typeof checklistTasks.$inferSelect;
export type InsertChecklistTask = z.infer<typeof insertChecklistTaskSchema>;
export type CreateChecklistTask = z.infer<typeof createChecklistTaskSchema>;

// Couple Profiles for messaging
export const coupleProfiles = pgTable("couple_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  password: text("password").notNull(),
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
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Budget items for couples
export const coupleBudgetItems = pgTable("couple_budget_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  label: text("label").notNull(),
  estimatedCost: integer("estimated_cost").notNull().default(0),
  actualCost: integer("actual_cost"),
  isPaid: boolean("is_paid").notNull().default(false),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleBudgetSettings = pgTable("couple_budget_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
  totalBudget: integer("total_budget").notNull().default(0),
  currency: text("currency").notNull().default("NOK"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dress tracking for couples
export const coupleDressAppointments = pgTable("couple_dress_appointments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  shopName: text("shop_name").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleDressFavorites = pgTable("couple_dress_favorites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  designer: text("designer"),
  shop: text("shop"),
  price: integer("price").default(0),
  imageUrl: text("image_url"),
  notes: text("notes"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleDressTimeline = pgTable("couple_dress_timeline", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
  ordered: boolean("ordered").notNull().default(false),
  orderedDate: text("ordered_date"),
  firstFitting: boolean("first_fitting").notNull().default(false),
  firstFittingDate: text("first_fitting_date"),
  alterations: boolean("alterations").notNull().default(false),
  alterationsDate: text("alterations_date"),
  finalFitting: boolean("final_fitting").notNull().default(false),
  finalFittingDate: text("final_fitting_date"),
  pickup: boolean("pickup").notNull().default(false),
  pickupDate: text("pickup_date"),
  budget: integer("budget").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Important people for the wedding
export const coupleImportantPeople = pgTable("couple_important_people", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'bestman', 'maidofhonor', 'groomsman', 'bridesmaid', 'toastmaster', 'other'
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Photo shot list
export const couplePhotoShots = pgTable("couple_photo_shots", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'ceremony', 'portraits', 'group', 'details', 'reception'
  completed: boolean("completed").notNull().default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for new tables
export const createBudgetItemSchema = z.object({
  category: z.string().min(1),
  label: z.string().min(1),
  estimatedCost: z.number().int().min(0),
  actualCost: z.number().int().min(0).optional(),
  isPaid: z.boolean().optional(),
  notes: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const createDressAppointmentSchema = z.object({
  shopName: z.string().min(1),
  date: z.string().min(1),
  time: z.string().optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
});

export const createDressFavoriteSchema = z.object({
  name: z.string().min(1),
  designer: z.string().optional(),
  shop: z.string().optional(),
  price: z.number().int().min(0).optional(),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export const createImportantPersonSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['bestman', 'maidofhonor', 'groomsman', 'bridesmaid', 'toastmaster', 'other']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const createPhotoShotSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['ceremony', 'portraits', 'group', 'details', 'reception']),
  completed: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// Types for new tables
export type CoupleBudgetItem = typeof coupleBudgetItems.$inferSelect;
export type CoupleBudgetSettings = typeof coupleBudgetSettings.$inferSelect;
export type CoupleDressAppointment = typeof coupleDressAppointments.$inferSelect;
export type CoupleDressFavorite = typeof coupleDressFavorites.$inferSelect;
export type CoupleDressTimeline = typeof coupleDressTimeline.$inferSelect;
export type CoupleImportantPerson = typeof coupleImportantPeople.$inferSelect;
export type CouplePhotoShot = typeof couplePhotoShots.$inferSelect;

// Conversations between couples and vendors
export const conversations = pgTable("conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  vendorDeletedAt: timestamp("vendor_deleted_at"),
});

export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderType: text("sender_type").notNull(), // 'couple' or 'vendor'
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
  vendorDeletedAt: timestamp("vendor_deleted_at"),
});

// Admin conversations with vendors
export const adminConversations = pgTable("admin_conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  vendorUnreadCount: integer("vendor_unread_count").default(0),
  adminUnreadCount: integer("admin_unread_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminMessages = pgTable("admin_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => adminConversations.id, { onDelete: "cascade" }),
  senderType: text("sender_type").notNull(), // 'vendor' or 'admin'
  senderId: varchar("sender_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  editedAt: timestamp("edited_at"),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"),
  videoGuideId: varchar("video_guide_id").references(() => videoGuides.id, { onDelete: "set null" }),
});

export const sendAdminMessageSchema = z.object({
  conversationId: z.string().optional(),
  body: z.string().min(1, "Melding er påkrevd"),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional(),
  videoGuideId: z.string().optional(),
});

export type AdminConversation = typeof adminConversations.$inferSelect;
export type AdminMessage = typeof adminMessages.$inferSelect;
export type SendAdminMessage = z.infer<typeof sendAdminMessageSchema>;

export const insertCoupleProfileSchema = createInsertSchema(coupleProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const coupleLoginSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  displayName: z.string().min(2, "Navn må være minst 2 tegn"),
  password: z.string().min(8, "Passord må være minst 8 tegn"),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  vendorId: z.string().optional(),
  inspirationId: z.string().optional(),
  body: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional(),
}).refine(data => data.body || data.attachmentUrl, "Melding eller vedlegg er påkrevd");

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
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
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
  // Inventory tracking fields
  trackInventory: boolean("track_inventory").default(false),
  availableQuantity: integer("available_quantity"),
  reservedQuantity: integer("reserved_quantity").default(0),
  bookingBuffer: integer("booking_buffer").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorAvailability = pgTable(
  "vendor_availability",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    vendorId: varchar("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    name: text("name"), // optional label like "Summer vacation" or "Smith wedding"
    status: text("status").notNull().default("available"), // 'available', 'blocked', 'limited'
    maxBookings: integer("max_bookings"), // null means unlimited
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    vendorDateIdx: uniqueIndex("idx_vendor_availability_vendor_date").on(
      table.vendorId,
      table.date
    ),
    vendorIdx: index("idx_vendor_availability_vendor").on(table.vendorId),
    dateIdx: index("idx_vendor_availability_date").on(table.date),
  })
);

export const insertVendorAvailabilitySchema = createInsertSchema(
  vendorAvailability
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
  trackInventory: z.boolean().default(false),
  availableQuantity: z.number().int().optional(),
  reservedQuantity: z.number().int().min(0).default(0),
  bookingBuffer: z.number().int().min(0).default(0),
});

export const createVendorAvailabilitySchema = z.object({
  vendorId: z.string().uuid("Ugyldig vendor ID"),
  date: z.string().date("Ugyldig dato"),
  name: z.string().max(100).optional(),
  status: z.enum(["available", "blocked", "limited"]).default("available"),
  maxBookings: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export type VendorProduct = typeof vendorProducts.$inferSelect;
export type InsertVendorProduct = z.infer<typeof insertVendorProductSchema>;
export type CreateVendorProduct = z.infer<typeof createVendorProductSchema>;

export type VendorAvailability = typeof vendorAvailability.$inferSelect;
export type InsertVendorAvailability = z.infer<typeof insertVendorAvailabilitySchema>;
export type CreateVendorAvailability = z.infer<typeof createVendorAvailabilitySchema>;

// Vendor Offers to Couples
export const vendorOffers = pgTable("vendor_offers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
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
  offerId: varchar("offer_id").notNull().references(() => vendorOffers.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => vendorProducts.id, { onDelete: "set null" }), // Optional - can be custom line
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
  coupleId: varchar("couple_id").references(() => coupleProfiles.id, { onDelete: "cascade" }),
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
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
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

export const updateAppSettingSchema = z.object({
  value: z.string().min(1, "Verdi er påkrevd"),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = z.infer<typeof insertAppSettingSchema>;
export type UpdateAppSetting = z.infer<typeof updateAppSettingSchema>;

// What's New items for announcing features/updates
export const whatsNewItems = pgTable("whats_new_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  category: text("category").notNull().default("vendor"), // vendor or couple
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("star"),
  minAppVersion: text("min_app_version").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWhatsNewSchema = createInsertSchema(whatsNewItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  category: z.enum(["vendor", "couple"]).default("vendor"),
});

export const updateWhatsNewSchema = z.object({
  category: z.enum(["vendor", "couple"]).default("vendor"),
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  icon: z.string().default("star"),
  minAppVersion: z.string().min(1, "Minimumversjon er påkrevd"),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export type WhatsNewItem = typeof whatsNewItems.$inferSelect;
export type InsertWhatsNewItem = z.infer<typeof insertWhatsNewSchema>;
export type UpdateWhatsNewItem = z.infer<typeof updateWhatsNewSchema>;

// Schedule Events - Server-side storage for sharing with coordinators
export const scheduleEvents = pgTable("schedule_events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  time: text("time").notNull(), // HH:mm format
  title: text("title").notNull(),
  icon: text("icon").default("star"), // heart, camera, music, users, coffee, sun, moon, star
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertScheduleEventSchema = createInsertSchema(scheduleEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ScheduleEvent = typeof scheduleEvents.$inferSelect;
export type InsertScheduleEvent = z.infer<typeof insertScheduleEventSchema>;

// Coordinator Invitations - For toastmasters and other helpers
export const coordinatorInvitations = pgTable("coordinator_invitations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  email: text("email"),
  name: text("name").notNull(), // Display name like "Toastmaster Ole"
  roleLabel: text("role_label").notNull().default("Toastmaster"), // Toastmaster, Koordinator, etc.
  accessToken: text("access_token").notNull().unique(),
  accessCode: text("access_code"), // Optional 6-digit code for easy access
  canViewSpeeches: boolean("can_view_speeches").default(true),
  canViewSchedule: boolean("can_view_schedule").default(true),
  canEditSpeeches: boolean("can_edit_speeches").default(false), // Edit permission for speeches
  canEditSchedule: boolean("can_edit_schedule").default(false), // Edit permission for schedule
  status: text("status").notNull().default("active"), // active, revoked, expired
  expiresAt: timestamp("expires_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCoordinatorInvitationSchema = createInsertSchema(coordinatorInvitations).omit({
  id: true,
  accessToken: true,
  accessCode: true,
  status: true,
  lastAccessedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const createCoordinatorInvitationSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email().optional().or(z.literal("")),
  roleLabel: z.string().default("Toastmaster"),
  canViewSpeeches: z.boolean().default(true),
  canViewSchedule: z.boolean().default(true),
  canEditSpeeches: z.boolean().default(false),
  canEditSchedule: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

export type CoordinatorInvitation = typeof coordinatorInvitations.$inferSelect;
export type InsertCoordinatorInvitation = z.infer<typeof insertCoordinatorInvitationSchema>;
export type CreateCoordinatorInvitation = z.infer<typeof createCoordinatorInvitationSchema>;

// Guest Invitations - Send invite links to guests with response fields
export const guestInvitations = pgTable("guest_invitations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  template: text("template").notNull().default("classic"), // classic, floral, modern
  message: text("message"),
  inviteToken: text("invite_token").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, sent, responded, declined
  responseAttending: boolean("response_attending"),
  responseDietary: text("response_dietary"),
  responseAllergies: text("response_allergies"),
  responseNotes: text("response_notes"),
  responsePlusOne: text("response_plus_one"),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGuestInvitationSchema = createInsertSchema(guestInvitations).omit({
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
  updatedAt: true,
});

export const createGuestInvitationSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  template: z.enum(["classic", "floral", "modern"]).default("classic"),
  message: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional(),
});

export type GuestInvitation = typeof guestInvitations.$inferSelect;
export type InsertGuestInvitation = z.infer<typeof insertGuestInvitationSchema>;
export type CreateGuestInvitation = z.infer<typeof createGuestInvitationSchema>;

// Couple-Vendor Contracts - Tracks active agreements for notifications
export const coupleVendorContracts = pgTable("couple_vendor_contracts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  offerId: varchar("offer_id").references(() => vendorOffers.id, { onDelete: "set null" }), // Link to accepted offer
  status: text("status").notNull().default("active"), // active, completed, cancelled
  vendorRole: text("vendor_role"), // "photographer", "videographer", "caterer", etc.
  notifyOnScheduleChanges: boolean("notify_on_schedule_changes").default(true),
  notifyOnSpeechChanges: boolean("notify_on_speech_changes").default(true),
  canViewSchedule: boolean("can_view_schedule").default(true),
  canViewSpeeches: boolean("can_view_speeches").default(false),
  canViewTableSeating: boolean("can_view_table_seating").default(false),
  notifyOnTableChanges: boolean("notify_on_table_changes").default(false),
  completedAt: timestamp("completed_at"),
  reviewReminderSentAt: timestamp("review_reminder_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCoupleVendorContractSchema = createInsertSchema(coupleVendorContracts).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type CoupleVendorContract = typeof coupleVendorContracts.$inferSelect;
export type InsertCoupleVendorContract = z.infer<typeof insertCoupleVendorContractSchema>;

// Notifications - In-app notifications for couples and vendors
export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipientType: text("recipient_type").notNull(), // "couple", "vendor", "coordinator"
  recipientId: varchar("recipient_id").notNull(), // coupleId, vendorId, or coordinatorInvitationId
  type: text("type").notNull(), // "schedule_changed", "speech_changed", "vendor_update", "offer_accepted", etc.
  title: text("title").notNull(),
  body: text("body"),
  payload: text("payload"), // JSON string with additional data
  relatedEntityType: text("related_entity_type"), // "schedule_event", "speech", "offer", etc.
  relatedEntityId: varchar("related_entity_id"),
  actorType: text("actor_type"), // "couple", "vendor", "coordinator"
  actorId: varchar("actor_id"),
  actorName: text("actor_name"),
  readAt: timestamp("read_at"),
  sentVia: text("sent_via").default("in_app"), // "in_app", "push", "email"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  readAt: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Activity Log - Audit trail for schedule/speech changes
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  actorType: text("actor_type").notNull(), // "couple", "coordinator"
  actorId: varchar("actor_id").notNull(), // coupleId or coordinatorInvitationId
  actorName: text("actor_name"),
  action: text("action").notNull(), // "created", "updated", "deleted"
  entityType: text("entity_type").notNull(), // "schedule_event", "speech"
  entityId: varchar("entity_id").notNull(),
  previousValue: text("previous_value"), // JSON snapshot
  newValue: text("new_value"), // JSON snapshot
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;

// Wedding Guests - Guest list with RSVPs and dietary info
export const weddingGuests = pgTable("wedding_guests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  category: text("category"), // "family", "friends", "colleagues", "reserved", "other"
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "declined"
  dietaryRequirements: text("dietary_requirements"),
  allergies: text("allergies"),
  notes: text("notes"),
  plusOne: boolean("plus_one").notNull().default(false),
  plusOneName: text("plus_one_name"),
  tableNumber: integer("table_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWeddingGuestSchema = createInsertSchema(weddingGuests).omit({
  id: true,
  coupleId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWeddingGuestSchema = insertWeddingGuestSchema.partial();

export type WeddingGuest = typeof weddingGuests.$inferSelect;
export type InsertWeddingGuest = z.infer<typeof insertWeddingGuestSchema>;
export type UpdateWeddingGuest = z.infer<typeof updateWeddingGuestSchema>;

// Wedding Tables - Table seating with categories and labels
export const weddingTables = pgTable("wedding_tables", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  tableNumber: integer("table_number").notNull(),
  name: text("name").notNull(), // "Bord 1", "Hovedbord", etc.
  category: text("category"), // "bride_family", "groom_family", "friends", "colleagues", "reserved", "main"
  label: text("label"), // Custom label like "Brudens familie", "Brudgommens venner", etc.
  seats: integer("seats").notNull().default(8),
  isReserved: boolean("is_reserved").notNull().default(false),
  notes: text("notes"), // Private notes for couple
  vendorNotes: text("vendor_notes"), // Notes visible to venue/decorators
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWeddingTableSchema = createInsertSchema(weddingTables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WeddingTable = typeof weddingTables.$inferSelect;
export type InsertWeddingTable = z.infer<typeof insertWeddingTableSchema>;

// Table Guest Assignments - Which guest is at which table
export const tableGuestAssignments = pgTable("table_guest_assignments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  tableId: varchar("table_id").notNull().references(() => weddingTables.id, { onDelete: "cascade" }),
  guestId: varchar("guest_id").notNull().references(() => weddingGuests.id, { onDelete: "cascade" }),
  seatNumber: integer("seat_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TableGuestAssignment = typeof tableGuestAssignments.$inferSelect;

// Table Seating Invitations - Share table seating with venue/decorators
export const tableSeatingInvitations = pgTable("table_seating_invitations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  recipientName: text("recipient_name").notNull(), // "Lokalet AS", "Dekoratør Hansen"
  recipientType: text("recipient_type").notNull(), // "venue", "decorator", "planner", "other"
  email: text("email"),
  phone: text("phone"),
  accessToken: text("access_token").notNull().unique(),
  accessCode: text("access_code").notNull(), // 6-digit code for easy entry
  canSeeGuestNames: boolean("can_see_guest_names").notNull().default(true),
  canSeeNotes: boolean("can_see_notes").notNull().default(false), // Whether they can see vendor_notes
  expiresAt: timestamp("expires_at"),
  status: text("status").notNull().default("active"), // "active", "revoked"
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTableSeatingInvitationSchema = createInsertSchema(tableSeatingInvitations).omit({
  id: true,
  accessToken: true,
  accessCode: true,
  status: true,
  lastAccessedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type TableSeatingInvitation = typeof tableSeatingInvitations.$inferSelect;
export type InsertTableSeatingInvitation = z.infer<typeof insertTableSeatingInvitationSchema>;

// App Feedback - Feedback to Wedflow from couples and vendors
export const appFeedback = pgTable("app_feedback", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  submitterType: text("submitter_type").notNull(), // "couple", "vendor"
  submitterId: varchar("submitter_id").notNull(), // coupleId or vendorId
  category: text("category").notNull(), // "bug", "feature_request", "general", "complaint"
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "reviewed", "resolved", "closed"
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppFeedbackSchema = createInsertSchema(appFeedback).omit({
  id: true,
  status: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true,
});

export type AppFeedback = typeof appFeedback.$inferSelect;
export type InsertAppFeedback = z.infer<typeof insertAppFeedbackSchema>;

// Vendor Reviews - Couples review vendors after completed contracts
export const vendorReviews = pgTable("vendor_reviews", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => coupleVendorContracts.id, { onDelete: "cascade" }),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title"),
  body: text("body"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false), // Admin moderation
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"), // Admin ID
  editableUntil: timestamp("editable_until"), // Can edit within 14 days
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVendorReviewSchema = createInsertSchema(vendorReviews).omit({
  id: true,
  isApproved: true,
  approvedAt: true,
  approvedBy: true,
  editableUntil: true,
  createdAt: true,
  updatedAt: true,
});

export type VendorReview = typeof vendorReviews.$inferSelect;
export type InsertVendorReview = z.infer<typeof insertVendorReviewSchema>;

// Vendor Review Responses - Vendors can respond to reviews
export const vendorReviewResponses = pgTable("vendor_review_responses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull().references(() => vendorReviews.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVendorReviewResponseSchema = createInsertSchema(vendorReviewResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type VendorReviewResponse = typeof vendorReviewResponses.$inferSelect;
export type InsertVendorReviewResponse = z.infer<typeof insertVendorReviewResponseSchema>;

// FAQ Items - Admin editable FAQ for both couples and vendors
export const faqItems = pgTable("faq_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // 'couple' or 'vendor'
  icon: text("icon").notNull(), // Feather icon name
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFaqItemSchema = createInsertSchema(faqItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFaqItemSchema = z.object({
  category: z.enum(["couple", "vendor"]).optional(),
  icon: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type FaqItem = typeof faqItems.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
export type UpdateFaqItem = z.infer<typeof updateFaqItemSchema>;
// Video Guides - Admin-managed video guides for vendors
export const videoGuides = pgTable("video_guides", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnail: text("thumbnail"),
  duration: text("duration"), // HH:mm:ss format
  category: text("category").notNull().default("vendor"), // vendor or couple
  icon: text("icon").notNull().default("video"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVideoGuideSchema = createInsertSchema(videoGuides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  category: z.enum(["vendor", "couple"]).default("vendor"),
});

export const updateVideoGuideSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  videoUrl: z.string().url("Gyldig video-URL er påkrevd"),
  thumbnail: z.string().optional(),
  duration: z.string().optional(),
  category: z.enum(["vendor", "couple"]).default("vendor"),
  icon: z.string().default("video"),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export type VideoGuide = typeof videoGuides.$inferSelect;
export type InsertVideoGuide = z.infer<typeof insertVideoGuideSchema>;
export type UpdateVideoGuide = z.infer<typeof updateVideoGuideSchema>;

// ===== SUBSCRIPTION & PRICING =====

// Subscription Tiers
export const subscriptionTiers = pgTable("subscription_tiers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // "Starter", "Professional", "Enterprise"
  displayName: text("display_name").notNull(),
  description: text("description"),
  priceNok: integer("price_nok").notNull(), // Price in NOK per month
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  
  // Feature limits per tier
  maxInspirationPhotos: integer("max_inspiration_photos").notNull().default(10), // Gallery/showcase photos
  maxProducts: integer("max_products").notNull().default(5), // Product catalog items
  maxMonthlyOffers: integer("max_monthly_offers").notNull().default(10), // Offers to couples per month
  maxMonthlyDeliveries: integer("max_monthly_deliveries").notNull().default(5), // Deliveries per month
  maxStorageGb: integer("max_storage_gb").notNull().default(5), // File storage limit
  
  // Features
    canSendMessages: boolean("can_send_messages").notNull().default(true), // Chat with couples
    canReceiveInquiries: boolean("can_receive_inquiries").notNull().default(true), // Get contacted by couples
    canCreateOffers: boolean("can_create_offers").notNull().default(true), // Send quotes/offers
    canCreateDeliveries: boolean("can_create_deliveries").notNull().default(true), // Upload deliveries
    canShowcaseWork: boolean("can_showcase_work").notNull().default(true), // Post inspirations
  hasAdvancedAnalytics: boolean("has_advanced_analytics").notNull().default(false),
  hasPrioritizedSearch: boolean("has_prioritized_search").notNull().default(false),
  canHighlightProfile: boolean("can_highlight_profile").notNull().default(false), // Featured placement
  canUseVideoGallery: boolean("can_use_video_gallery").notNull().default(false), // Video uploads
  hasReviewBadge: boolean("has_review_badge").notNull().default(false), // Premium badge
  hasMultipleCategories: boolean("has_multiple_categories").notNull().default(false), // List in multiple categories
  
  // Pricing adjustments
  commissionPercentage: integer("commission_percentage").notNull().default(3), // 3% = 300 basis points
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor Subscriptions
export const vendorSubscriptions = pgTable("vendor_subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  tierId: varchar("tier_id").notNull().references(() => subscriptionTiers.id),
  
  // Stripe subscription info
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  
  // Status
  status: text("status").notNull().default("active"), // active, cancelled, past_due, paused
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  pausedUntil: timestamp("paused_until"),
  
  // Auto-renewal
  autoRenew: boolean("auto_renew").notNull().default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Usage tracking per month
export const vendorUsageMetrics = pgTable("vendor_usage_metrics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  
  // Usage counts
  inspirationPhotosUploaded: integer("inspiration_photos_uploaded").notNull().default(0),
  videoMinutesUsed: integer("video_minutes_used").notNull().default(0),
  storageUsedGb: integer("storage_used_gb").notNull().default(0),
  profileViewsCount: integer("profile_views_count").notNull().default(0),
  messagesSent: integer("messages_sent").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice/Payment records
export const vendorPayments = pgTable("vendor_payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id").references(() => vendorSubscriptions.id),
  
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  
  amountNok: integer("amount_nok").notNull(), // Amount in øre (cents)
  currency: text("currency").notNull().default("NOK"),
  
  status: text("status").notNull().default("pending"), // pending, succeeded, failed, refunded
  description: text("description"),
  
  billingPeriodStart: timestamp("billing_period_start"),
  billingPeriodEnd: timestamp("billing_period_end"),
  
  paidAt: timestamp("paid_at"),
  failureReason: text("failure_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSubscriptionTierSchema = z.object({
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
  stripeFeePercentage: z.number().int().optional(),
});

export const insertVendorSubscriptionSchema = createInsertSchema(vendorSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorUsageSchema = createInsertSchema(vendorUsageMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorPaymentSchema = createInsertSchema(vendorPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = z.infer<typeof insertSubscriptionTierSchema>;
export type UpdateSubscriptionTier = z.infer<typeof updateSubscriptionTierSchema>;

export type VendorSubscription = typeof vendorSubscriptions.$inferSelect;
export type InsertVendorSubscription = z.infer<typeof insertVendorSubscriptionSchema>;

export type VendorUsageMetrics = typeof vendorUsageMetrics.$inferSelect;
export type InsertVendorUsageMetrics = z.infer<typeof insertVendorUsageSchema>;

export type VendorPayment = typeof vendorPayments.$inferSelect;
export type InsertVendorPayment = z.infer<typeof insertVendorPaymentSchema>;

// ===== HAIR & MAKEUP PLANNING =====

export const coupleHairMakeupAppointments = pgTable("couple_hair_makeup_appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  stylistName: text("stylist_name").notNull(),
  serviceType: text("service_type").notNull(), // "hair", "makeup", "both"
  appointmentType: text("appointment_type").notNull(), // "consultation", "trial", "wedding_day"
  date: text("date").notNull(),
  time: text("time"),
  location: text("location"),
  notes: text("notes"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleHairMakeupLooks = pgTable("couple_hair_makeup_looks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  lookType: text("look_type").notNull(), // "hair", "makeup", "full_look"
  imageUrl: text("image_url"),
  notes: text("notes"),
  isFavorite: boolean("is_favorite").default(false),
  isSelected: boolean("is_selected").default(false), // the chosen look
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleHairMakeupTimeline = pgTable("couple_hair_makeup_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
  consultationBooked: boolean("consultation_booked").default(false),
  consultationDate: text("consultation_date"),
  trialBooked: boolean("trial_booked").default(false),
  trialDate: text("trial_date"),
  lookSelected: boolean("look_selected").default(false),
  lookSelectedDate: text("look_selected_date"),
  weddingDayBooked: boolean("wedding_day_booked").default(false),
  budget: integer("budget").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CoupleHairMakeupAppointment = typeof coupleHairMakeupAppointments.$inferSelect;
export type CoupleHairMakeupLook = typeof coupleHairMakeupLooks.$inferSelect;
export type CoupleHairMakeupTimeline = typeof coupleHairMakeupTimeline.$inferSelect;

// ===== TRANSPORT PLANNING =====

export const coupleTransportBookings = pgTable("couple_transport_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  vehicleType: text("vehicle_type").notNull(), // "bride_car", "groom_car", "guest_shuttle", "getaway_car"
  providerName: text("provider_name"),
  vehicleDescription: text("vehicle_description"),
  pickupTime: text("pickup_time"),
  pickupLocation: text("pickup_location"),
  dropoffTime: text("dropoff_time"),
  dropoffLocation: text("dropoff_location"),
  driverName: text("driver_name"),
  driverPhone: text("driver_phone"),
  price: integer("price").default(0),
  notes: text("notes"),
  confirmed: boolean("confirmed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleTransportTimeline = pgTable("couple_transport_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
  brideCarBooked: boolean("bride_car_booked").default(false),
  groomCarBooked: boolean("groom_car_booked").default(false),
  guestShuttleBooked: boolean("guest_shuttle_booked").default(false),
  getawayCarBooked: boolean("getaway_car_booked").default(false),
  allConfirmed: boolean("all_confirmed").default(false),
  budget: integer("budget").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CoupleTransportBooking = typeof coupleTransportBookings.$inferSelect;
export type CoupleTransportTimeline = typeof coupleTransportTimeline.$inferSelect;

// ===== FLOWERS/FLORIST PLANNING =====

export const coupleFlowerAppointments = pgTable("couple_flower_appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  floristName: text("florist_name").notNull(),
  appointmentType: text("appointment_type").notNull(), // "consultation", "mockup", "delivery_planning"
  date: text("date").notNull(),
  time: text("time"),
  location: text("location"),
  notes: text("notes"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleFlowerSelections = pgTable("couple_flower_selections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(), // "bridal_bouquet", "bridesmaid_bouquet", "boutonniere", "centerpiece", "ceremony_flowers", "other"
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  quantity: integer("quantity").default(1),
  estimatedPrice: integer("estimated_price").default(0),
  isConfirmed: boolean("is_confirmed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleFlowerTimeline = pgTable("couple_flower_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
  floristSelected: boolean("florist_selected").default(false),
  floristSelectedDate: text("florist_selected_date"),
  consultationDone: boolean("consultation_done").default(false),
  consultationDate: text("consultation_date"),
  mockupApproved: boolean("mockup_approved").default(false),
  mockupApprovedDate: text("mockup_approved_date"),
  deliveryConfirmed: boolean("delivery_confirmed").default(false),
  budget: integer("budget").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CoupleFlowerAppointment = typeof coupleFlowerAppointments.$inferSelect;
export type CoupleFlowerSelection = typeof coupleFlowerSelections.$inferSelect;
export type CoupleFlowerTimeline = typeof coupleFlowerTimeline.$inferSelect;

// ===== CATERING PLANNING =====

export const coupleCateringTastings = pgTable("couple_catering_tastings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  catererName: text("caterer_name").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  location: text("location"),
  notes: text("notes"),
  rating: integer("rating"), // 1-5 stars
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleCateringMenu = pgTable("couple_catering_menu", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  courseType: text("course_type").notNull(), // "appetizer", "main", "dessert", "drinks", "late_night"
  dishName: text("dish_name").notNull(),
  description: text("description"),
  isVegetarian: boolean("is_vegetarian").default(false),
  isVegan: boolean("is_vegan").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  isSelected: boolean("is_selected").default(false),
  pricePerPerson: integer("price_per_person").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleCateringDietaryNeeds = pgTable("couple_catering_dietary_needs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  guestName: text("guest_name").notNull(),
  dietaryType: text("dietary_type").notNull(), // "vegetarian", "vegan", "gluten_free", "nut_allergy", "lactose_intolerant", "halal", "kosher", "other"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleCateringTimeline = pgTable("couple_catering_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
  catererSelected: boolean("caterer_selected").default(false),
  catererSelectedDate: text("caterer_selected_date"),
  tastingCompleted: boolean("tasting_completed").default(false),
  tastingDate: text("tasting_date"),
  menuFinalized: boolean("menu_finalized").default(false),
  menuFinalizedDate: text("menu_finalized_date"),
  guestCountConfirmed: boolean("guest_count_confirmed").default(false),
  guestCount: integer("guest_count").default(0),
  budget: integer("budget").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CoupleCateringTasting = typeof coupleCateringTastings.$inferSelect;
export type CoupleCateringMenu = typeof coupleCateringMenu.$inferSelect;
export type CoupleCateringDietaryNeed = typeof coupleCateringDietaryNeeds.$inferSelect;
export type CoupleCateringTimeline = typeof coupleCateringTimeline.$inferSelect;

// ===== WEDDING CAKE PLANNING =====

export const coupleCakeTastings = pgTable("couple_cake_tastings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  bakeryName: text("bakery_name").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  location: text("location"),
  flavorsToTry: text("flavors_to_try"), // comma-separated
  notes: text("notes"),
  rating: integer("rating"), // 1-5 stars
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleCakeDesigns = pgTable("couple_cake_designs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  tiers: integer("tiers").default(3),
  flavor: text("flavor"),
  filling: text("filling"),
  frosting: text("frosting"), // "buttercream", "fondant", "naked", "ganache"
  style: text("style"), // "classic", "modern", "rustic", "floral", "minimalist"
  estimatedPrice: integer("estimated_price").default(0),
  estimatedServings: integer("estimated_servings"),
  isFavorite: boolean("is_favorite").default(false),
  isSelected: boolean("is_selected").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupleCakeTimeline = pgTable("couple_cake_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
  bakerySelected: boolean("bakery_selected").default(false),
  bakerySelectedDate: text("bakery_selected_date"),
  tastingCompleted: boolean("tasting_completed").default(false),
  tastingDate: text("tasting_date"),
  designFinalized: boolean("design_finalized").default(false),
  designFinalizedDate: text("design_finalized_date"),
  depositPaid: boolean("deposit_paid").default(false),
  deliveryConfirmed: boolean("delivery_confirmed").default(false),
  budget: integer("budget").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CoupleCakeTasting = typeof coupleCakeTastings.$inferSelect;
export type CoupleCakeDesign = typeof coupleCakeDesigns.$inferSelect;
export type CoupleCakeTimeline = typeof coupleCakeTimeline.$inferSelect;