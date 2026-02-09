var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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
  coupleBudgetItems: () => coupleBudgetItems,
  coupleBudgetSettings: () => coupleBudgetSettings,
  coupleCakeDesigns: () => coupleCakeDesigns,
  coupleCakeTastings: () => coupleCakeTastings,
  coupleCakeTimeline: () => coupleCakeTimeline,
  coupleCateringDietaryNeeds: () => coupleCateringDietaryNeeds,
  coupleCateringMenu: () => coupleCateringMenu,
  coupleCateringTastings: () => coupleCateringTastings,
  coupleCateringTimeline: () => coupleCateringTimeline,
  coupleDressAppointments: () => coupleDressAppointments,
  coupleDressFavorites: () => coupleDressFavorites,
  coupleDressTimeline: () => coupleDressTimeline,
  coupleFlowerAppointments: () => coupleFlowerAppointments,
  coupleFlowerSelections: () => coupleFlowerSelections,
  coupleFlowerTimeline: () => coupleFlowerTimeline,
  coupleHairMakeupAppointments: () => coupleHairMakeupAppointments,
  coupleHairMakeupLooks: () => coupleHairMakeupLooks,
  coupleHairMakeupTimeline: () => coupleHairMakeupTimeline,
  coupleImportantPeople: () => coupleImportantPeople,
  coupleLoginSchema: () => coupleLoginSchema,
  coupleMusicPerformances: () => coupleMusicPerformances,
  coupleMusicSetlists: () => coupleMusicSetlists,
  coupleMusicTimeline: () => coupleMusicTimeline,
  couplePhotoShots: () => couplePhotoShots,
  couplePhotographerSessions: () => couplePhotographerSessions,
  couplePhotographerShots: () => couplePhotographerShots,
  couplePhotographerTimeline: () => couplePhotographerTimeline,
  coupleProfiles: () => coupleProfiles,
  coupleSessions: () => coupleSessions,
  coupleTransportBookings: () => coupleTransportBookings,
  coupleTransportTimeline: () => coupleTransportTimeline,
  coupleVendorContracts: () => coupleVendorContracts,
  coupleVenueBookings: () => coupleVenueBookings,
  coupleVenueTimelines: () => coupleVenueTimelines,
  coupleVideographerDeliverables: () => coupleVideographerDeliverables,
  coupleVideographerSessions: () => coupleVideographerSessions,
  coupleVideographerTimeline: () => coupleVideographerTimeline,
  createBudgetItemSchema: () => createBudgetItemSchema,
  createChecklistTaskSchema: () => createChecklistTaskSchema,
  createCoordinatorInvitationSchema: () => createCoordinatorInvitationSchema,
  createCreatorhubBookingSchema: () => createCreatorhubBookingSchema,
  createCreatorhubCrmNoteSchema: () => createCreatorhubCrmNoteSchema,
  createCreatorhubInvitationSchema: () => createCreatorhubInvitationSchema,
  createCreatorhubProjectSchema: () => createCreatorhubProjectSchema,
  createDeliverySchema: () => createDeliverySchema,
  createDressAppointmentSchema: () => createDressAppointmentSchema,
  createDressFavoriteSchema: () => createDressFavoriteSchema,
  createGuestInvitationSchema: () => createGuestInvitationSchema,
  createImportantPersonSchema: () => createImportantPersonSchema,
  createInquirySchema: () => createInquirySchema,
  createInspirationSchema: () => createInspirationSchema,
  createOfferSchema: () => createOfferSchema,
  createPhotoShotSchema: () => createPhotoShotSchema,
  createReminderSchema: () => createReminderSchema,
  createSpeechSchema: () => createSpeechSchema,
  createVendorAvailabilitySchema: () => createVendorAvailabilitySchema,
  createVendorProductSchema: () => createVendorProductSchema,
  creatorhubAnalyticsEvents: () => creatorhubAnalyticsEvents,
  creatorhubApiAuditLog: () => creatorhubApiAuditLog,
  creatorhubBookings: () => creatorhubBookings,
  creatorhubCrmNotes: () => creatorhubCrmNotes,
  creatorhubInvitations: () => creatorhubInvitations,
  creatorhubProjects: () => creatorhubProjects,
  creatorhubUsers: () => creatorhubUsers,
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
  insertCoupleVenueBookingSchema: () => insertCoupleVenueBookingSchema,
  insertCoupleVenueTimelineSchema: () => insertCoupleVenueTimelineSchema,
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
  insertVendorAvailabilitySchema: () => insertVendorAvailabilitySchema,
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
  insertVendorVenueAvailabilitySchema: () => insertVendorVenueAvailabilitySchema,
  insertVendorVenueBookingSchema: () => insertVendorVenueBookingSchema,
  insertVendorVenueTimelineSchema: () => insertVendorVenueTimelineSchema,
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
  vendorAvailability: () => vendorAvailability,
  vendorCategories: () => vendorCategories,
  vendorCategoryDetails: () => vendorCategoryDetails,
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
  vendorVenueAvailability: () => vendorVenueAvailability,
  vendorVenueBookings: () => vendorVenueBookings,
  vendorVenueTimelines: () => vendorVenueTimelines,
  vendors: () => vendors,
  videoGuides: () => videoGuides,
  weddingGuests: () => weddingGuests,
  weddingTables: () => weddingTables,
  whatsNewItems: () => whatsNewItems
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, insertUserSchema, vendorCategories, vendors, vendorSessions, insertVendorCategorySchema, insertVendorSchema, vendorRegistrationSchema, vendorFeatures, vendorInspirationCategories, vendorCategoryDetails, deliveries, deliveryItems, insertDeliverySchema, insertDeliveryItemSchema, createDeliverySchema, inspirationCategories, inspirations, inspirationMedia, insertInspirationCategorySchema, insertInspirationSchema, insertInspirationMediaSchema, createInspirationSchema, inspirationInquiries, createInquirySchema, checklistTasks, insertChecklistTaskSchema, createChecklistTaskSchema, coupleProfiles, coupleSessions, coupleBudgetItems, coupleBudgetSettings, coupleDressAppointments, coupleDressFavorites, coupleDressTimeline, coupleImportantPeople, couplePhotoShots, createBudgetItemSchema, createDressAppointmentSchema, createDressFavoriteSchema, createImportantPersonSchema, createPhotoShotSchema, conversations, messages, adminConversations, adminMessages, sendAdminMessageSchema, insertCoupleProfileSchema, coupleLoginSchema, sendMessageSchema, reminders, insertReminderSchema, createReminderSchema, vendorProducts, vendorAvailability, insertVendorAvailabilitySchema, insertVendorProductSchema, createVendorProductSchema, createVendorAvailabilitySchema, coupleVenueBookings, coupleVenueTimelines, vendorVenueBookings, vendorVenueAvailability, vendorVenueTimelines, insertCoupleVenueBookingSchema, insertCoupleVenueTimelineSchema, insertVendorVenueBookingSchema, insertVendorVenueAvailabilitySchema, insertVendorVenueTimelineSchema, vendorOffers, vendorOfferItems, insertVendorOfferSchema, insertVendorOfferItemSchema, createOfferSchema, speeches, insertSpeechSchema, createSpeechSchema, messageReminders, appSettings, insertAppSettingSchema, updateAppSettingSchema, whatsNewItems, insertWhatsNewSchema, updateWhatsNewSchema, scheduleEvents, insertScheduleEventSchema, coordinatorInvitations, insertCoordinatorInvitationSchema, createCoordinatorInvitationSchema, guestInvitations, insertGuestInvitationSchema, createGuestInvitationSchema, coupleVendorContracts, insertCoupleVendorContractSchema, notifications, insertNotificationSchema, activityLogs, weddingGuests, insertWeddingGuestSchema, updateWeddingGuestSchema, weddingTables, insertWeddingTableSchema, tableGuestAssignments, tableSeatingInvitations, insertTableSeatingInvitationSchema, appFeedback, insertAppFeedbackSchema, vendorReviews, insertVendorReviewSchema, vendorReviewResponses, insertVendorReviewResponseSchema, faqItems, insertFaqItemSchema, updateFaqItemSchema, videoGuides, insertVideoGuideSchema, updateVideoGuideSchema, subscriptionTiers, vendorSubscriptions, vendorUsageMetrics, vendorPayments, insertSubscriptionTierSchema, updateSubscriptionTierSchema, insertVendorSubscriptionSchema, insertVendorUsageSchema, insertVendorPaymentSchema, coupleHairMakeupAppointments, coupleHairMakeupLooks, coupleHairMakeupTimeline, coupleTransportBookings, coupleTransportTimeline, coupleFlowerAppointments, coupleFlowerSelections, coupleFlowerTimeline, couplePhotographerSessions, couplePhotographerShots, couplePhotographerTimeline, coupleVideographerSessions, coupleVideographerDeliverables, coupleVideographerTimeline, coupleMusicPerformances, coupleMusicSetlists, coupleMusicTimeline, coupleCateringTastings, coupleCateringMenu, coupleCateringDietaryNeeds, coupleCateringTimeline, coupleCakeTastings, coupleCakeDesigns, coupleCakeTimeline, creatorhubProjects, creatorhubUsers, creatorhubInvitations, creatorhubBookings, creatorhubCrmNotes, creatorhubAnalyticsEvents, creatorhubApiAuditLog, createCreatorhubProjectSchema, createCreatorhubInvitationSchema, createCreatorhubBookingSchema, createCreatorhubCrmNoteSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      password: text("password").notNull()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true
    });
    vendorCategories = pgTable("vendor_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      icon: text("icon").notNull(),
      description: text("description")
    });
    vendors = pgTable("vendors", {
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
      culturalExpertise: text("cultural_expertise").array(),
      status: text("status").notNull().default("pending"),
      rejectionReason: text("rejection_reason"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vendorSessions = pgTable("vendor_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
      token: text("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertVendorCategorySchema = createInsertSchema(vendorCategories).pick({
      name: true,
      icon: true,
      description: true
    });
    insertVendorSchema = createInsertSchema(vendors).omit({
      id: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      updatedAt: true
    });
    vendorRegistrationSchema = z.object({
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
    vendorFeatures = pgTable("vendor_features", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
      featureKey: text("feature_key").notNull(),
      isEnabled: boolean("is_enabled").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vendorInspirationCategories = pgTable("vendor_inspiration_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
      categoryId: varchar("category_id").notNull().references(() => inspirationCategories.id, { onDelete: "cascade" }),
      assignedAt: timestamp("assigned_at").defaultNow()
    });
    vendorCategoryDetails = pgTable("vendor_category_details", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
      venueCapacityMin: integer("venue_capacity_min"),
      venueCapacityMax: integer("venue_capacity_max"),
      cateringMinGuests: integer("catering_min_guests"),
      cateringMaxGuests: integer("catering_max_guests"),
      venueType: text("venue_type"),
      venueLocation: text("venue_location"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    deliveries = pgTable("deliveries", {
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
    deliveryItems = pgTable("delivery_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      deliveryId: varchar("delivery_id").notNull().references(() => deliveries.id, { onDelete: "cascade" }),
      type: text("type").notNull(),
      label: text("label").notNull(),
      url: text("url").notNull(),
      description: text("description"),
      sortOrder: integer("sort_order").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertDeliverySchema = createInsertSchema(deliveries).omit({
      id: true,
      accessCode: true,
      status: true,
      createdAt: true,
      updatedAt: true
    });
    insertDeliveryItemSchema = createInsertSchema(deliveryItems).omit({
      id: true,
      createdAt: true
    });
    createDeliverySchema = z.object({
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
    inspirationCategories = pgTable("inspiration_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      icon: text("icon").notNull(),
      sortOrder: integer("sort_order").default(0)
    });
    inspirations = pgTable("inspirations", {
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
    inspirationMedia = pgTable("inspiration_media", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      inspirationId: varchar("inspiration_id").notNull().references(() => inspirations.id, { onDelete: "cascade" }),
      type: text("type").notNull(),
      url: text("url").notNull(),
      caption: text("caption"),
      sortOrder: integer("sort_order").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertInspirationCategorySchema = createInsertSchema(inspirationCategories).omit({
      id: true
    });
    insertInspirationSchema = createInsertSchema(inspirations).omit({
      id: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      updatedAt: true
    });
    insertInspirationMediaSchema = createInsertSchema(inspirationMedia).omit({
      id: true,
      createdAt: true
    });
    createInspirationSchema = z.object({
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
    inspirationInquiries = pgTable("inspiration_inquiries", {
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
    createInquirySchema = z.object({
      inspirationId: z.string(),
      name: z.string().min(2, "Navn m\xE5 v\xE6re minst 2 tegn"),
      email: z.string().email("Ugyldig e-postadresse"),
      phone: z.string().optional(),
      message: z.string().min(10, "Melding m\xE5 v\xE6re minst 10 tegn"),
      weddingDate: z.string().optional()
    });
    checklistTasks = pgTable("checklist_tasks", {
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
    insertChecklistTaskSchema = createInsertSchema(checklistTasks).omit({
      id: true,
      completedAt: true,
      completedBy: true,
      createdAt: true,
      updatedAt: true
    });
    createChecklistTaskSchema = z.object({
      title: z.string().min(1, "Tittel er p\xE5krevd"),
      monthsBefore: z.number().min(0).max(24).default(12),
      category: z.enum(["planning", "vendors", "attire", "logistics", "final"]).default("planning"),
      notes: z.string().optional(),
      assignedTo: z.string().optional()
    });
    coupleProfiles = pgTable("couple_profiles", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: text("email").notNull().unique(),
      displayName: text("display_name").notNull(),
      password: text("password").notNull(),
      partnerEmail: text("partner_email"),
      weddingDate: text("wedding_date"),
      selectedTraditions: text("selected_traditions").array(),
      lastActiveAt: timestamp("last_active_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleSessions = pgTable("couple_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      token: text("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    coupleBudgetItems = pgTable("couple_budget_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      category: text("category").notNull(),
      label: text("label").notNull(),
      estimatedCost: integer("estimated_cost").notNull().default(0),
      actualCost: integer("actual_cost"),
      isPaid: boolean("is_paid").notNull().default(false),
      notes: text("notes"),
      sortOrder: integer("sort_order").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleBudgetSettings = pgTable("couple_budget_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
      totalBudget: integer("total_budget").notNull().default(0),
      currency: text("currency").notNull().default("NOK"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleDressAppointments = pgTable("couple_dress_appointments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      shopName: text("shop_name").notNull(),
      date: text("date").notNull(),
      time: text("time"),
      notes: text("notes"),
      completed: boolean("completed").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleDressFavorites = pgTable("couple_dress_favorites", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      designer: text("designer"),
      shop: text("shop"),
      price: integer("price").default(0),
      imageUrl: text("image_url"),
      notes: text("notes"),
      isFavorite: boolean("is_favorite").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleDressTimeline = pgTable("couple_dress_timeline", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleImportantPeople = pgTable("couple_important_people", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      role: text("role").notNull(),
      // 'bestman', 'maidofhonor', 'groomsman', 'bridesmaid', 'toastmaster', 'other'
      phone: text("phone"),
      email: text("email"),
      notes: text("notes"),
      sortOrder: integer("sort_order").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    couplePhotoShots = pgTable("couple_photo_shots", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      description: text("description"),
      category: text("category").notNull(),
      // 'ceremony', 'portraits', 'group', 'details', 'reception'
      completed: boolean("completed").notNull().default(false),
      sortOrder: integer("sort_order").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    createBudgetItemSchema = z.object({
      category: z.string().min(1),
      label: z.string().min(1),
      estimatedCost: z.number().int().min(0),
      actualCost: z.number().int().min(0).optional(),
      isPaid: z.boolean().optional(),
      notes: z.string().optional(),
      sortOrder: z.number().int().optional()
    });
    createDressAppointmentSchema = z.object({
      shopName: z.string().min(1),
      date: z.string().min(1),
      time: z.string().optional(),
      notes: z.string().optional(),
      completed: z.boolean().optional()
    });
    createDressFavoriteSchema = z.object({
      name: z.string().min(1),
      designer: z.string().optional(),
      shop: z.string().optional(),
      price: z.number().int().min(0).optional(),
      imageUrl: z.string().optional(),
      notes: z.string().optional(),
      isFavorite: z.boolean().optional()
    });
    createImportantPersonSchema = z.object({
      name: z.string().min(1),
      role: z.enum(["bestman", "maidofhonor", "groomsman", "bridesmaid", "toastmaster", "other"]),
      phone: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      notes: z.string().optional(),
      sortOrder: z.number().int().optional()
    });
    createPhotoShotSchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(["ceremony", "portraits", "group", "details", "reception"]),
      completed: z.boolean().optional(),
      sortOrder: z.number().int().optional()
    });
    conversations = pgTable("conversations", {
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
    messages = pgTable("messages", {
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
    adminConversations = pgTable("admin_conversations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
      status: text("status").notNull().default("active"),
      lastMessageAt: timestamp("last_message_at").defaultNow(),
      vendorUnreadCount: integer("vendor_unread_count").default(0),
      adminUnreadCount: integer("admin_unread_count").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    adminMessages = pgTable("admin_messages", {
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
      attachmentType: text("attachment_type"),
      videoGuideId: varchar("video_guide_id").references(() => videoGuides.id, { onDelete: "set null" })
    });
    sendAdminMessageSchema = z.object({
      conversationId: z.string().optional(),
      body: z.string().min(1, "Melding er p\xE5krevd"),
      attachmentUrl: z.string().optional(),
      attachmentType: z.string().optional(),
      videoGuideId: z.string().optional()
    });
    insertCoupleProfileSchema = createInsertSchema(coupleProfiles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    coupleLoginSchema = z.object({
      email: z.string().email("Ugyldig e-postadresse"),
      displayName: z.string().min(2, "Navn m\xE5 v\xE6re minst 2 tegn"),
      password: z.string().min(8, "Passord m\xE5 v\xE6re minst 8 tegn")
    });
    sendMessageSchema = z.object({
      conversationId: z.string().optional(),
      vendorId: z.string().optional(),
      inspirationId: z.string().optional(),
      body: z.string().optional(),
      attachmentUrl: z.string().optional(),
      attachmentType: z.string().optional()
    }).refine((data) => data.body || data.attachmentUrl, "Melding eller vedlegg er p\xE5krevd");
    reminders = pgTable("reminders", {
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
    insertReminderSchema = createInsertSchema(reminders).omit({
      id: true,
      isCompleted: true,
      notificationId: true,
      createdAt: true,
      updatedAt: true
    });
    createReminderSchema = z.object({
      title: z.string().min(1, "Tittel er p\xE5krevd"),
      description: z.string().optional(),
      reminderDate: z.string(),
      category: z.enum(["general", "vendor", "budget", "guest", "planning"]).default("general")
    });
    vendorProducts = pgTable("vendor_products", {
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
      // Inventory tracking fields
      trackInventory: boolean("track_inventory").default(false),
      availableQuantity: integer("available_quantity"),
      reservedQuantity: integer("reserved_quantity").default(0),
      bookingBuffer: integer("booking_buffer").default(0),
      // Category-specific metadata
      metadata: text("metadata").$type(),
      // Venue-specific fields (for venue products)
      venueAddress: text("venue_address"),
      venueMaxGuests: integer("venue_max_guests"),
      venueMinGuests: integer("venue_min_guests"),
      venueCateringIncluded: boolean("venue_catering_included").default(false),
      venueAccommodationAvailable: boolean("venue_accommodation_available").default(false),
      venueCheckoutTime: text("venue_checkout_time"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vendorAvailability = pgTable(
      "vendor_availability",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
        date: date("date").notNull(),
        name: text("name"),
        // optional label like "Summer vacation" or "Smith wedding"
        status: text("status").notNull().default("available"),
        // 'available', 'blocked', 'limited'
        maxBookings: integer("max_bookings"),
        // null means unlimited
        notes: text("notes"),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow()
      },
      (table) => ({
        vendorDateIdx: uniqueIndex("idx_vendor_availability_vendor_date").on(
          table.vendorId,
          table.date
        ),
        vendorIdx: index("idx_vendor_availability_vendor").on(table.vendorId),
        dateIdx: index("idx_vendor_availability_date").on(table.date)
      })
    );
    insertVendorAvailabilitySchema = createInsertSchema(
      vendorAvailability
    ).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorProductSchema = createInsertSchema(vendorProducts).omit({
      id: true,
      isArchived: true,
      createdAt: true,
      updatedAt: true
    });
    createVendorProductSchema = z.object({
      title: z.string().min(2, "Tittel m\xE5 v\xE6re minst 2 tegn"),
      description: z.string().optional(),
      unitPrice: z.number().min(0, "Pris m\xE5 v\xE6re 0 eller h\xF8yere"),
      unitType: z.string().default("stk"),
      leadTimeDays: z.number().min(0).optional(),
      minQuantity: z.number().min(1).default(1),
      categoryTag: z.string().optional(),
      imageUrl: z.string().url("Ugyldig URL").optional().or(z.literal("")),
      sortOrder: z.number().default(0),
      trackInventory: z.boolean().default(false),
      availableQuantity: z.number().int().optional(),
      reservedQuantity: z.number().int().min(0).default(0),
      bookingBuffer: z.number().int().min(0).default(0)
    });
    createVendorAvailabilitySchema = z.object({
      vendorId: z.string().uuid("Ugyldig vendor ID"),
      date: z.string().date("Ugyldig dato"),
      name: z.string().max(100).optional(),
      status: z.enum(["available", "blocked", "limited"]).default("available"),
      maxBookings: z.number().int().positive().optional(),
      notes: z.string().optional()
    });
    coupleVenueBookings = pgTable("couple_venue_bookings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      vendorId: varchar("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
      // Link to vendor for site visits
      venueName: text("venue_name").notNull(),
      date: text("date").notNull(),
      // Stored as dd.MM.yyyy
      time: text("time"),
      location: text("location"),
      capacity: integer("capacity"),
      notes: text("notes"),
      status: text("status").default("considering"),
      // 'considering', 'booked', 'confirmed'
      isPrimary: boolean("is_primary").default(false),
      // Distinguish primary from secondary venues
      venueType: text("venue_type"),
      // 'ceremony', 'reception', 'party', 'accommodation', 'other'
      // Decision-making fields
      address: text("address"),
      maxGuests: integer("max_guests"),
      invitedGuests: integer("invited_guests"),
      cateringIncluded: boolean("catering_included").default(false),
      accommodationAvailable: boolean("accommodation_available").default(false),
      checkoutTime: text("checkout_time"),
      // When venue must be vacated
      // Site visit / befaring fields
      siteVisitDate: text("site_visit_date"),
      // Date of scheduled site visit
      siteVisitTime: text("site_visit_time"),
      // Time of site visit
      visitNotesLiked: text("visit_notes_liked"),
      // "Hva likte vi?"
      visitNotesUnsure: text("visit_notes_unsure"),
      // "Hva var vi usikre på?"
      // Vendor tracking fields
      vendorVisitConfirmed: boolean("vendor_visit_confirmed").default(false),
      // Vendor confirmed the visit
      vendorVisitNotes: text("vendor_visit_notes"),
      // Vendor's notes about the visit
      vendorVisitCompleted: boolean("vendor_visit_completed").default(false),
      // Visit has been completed
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleVenueTimelines = pgTable("couple_venue_timelines", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
      venueSelected: boolean("venue_selected").default(false),
      venueVisited: boolean("venue_visited").default(false),
      contractSigned: boolean("contract_signed").default(false),
      depositPaid: boolean("deposit_paid").default(false),
      capacity: integer("capacity"),
      budget: integer("budget"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vendorVenueBookings = pgTable("vendor_venue_bookings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
      coupleName: text("couple_name").notNull(),
      date: text("date").notNull(),
      // Stored as dd.MM.yyyy
      time: text("time"),
      location: text("location"),
      capacity: integer("capacity"),
      notes: text("notes"),
      status: text("status").default("considering"),
      // 'considering', 'booked', 'confirmed'
      // Decision-making fields
      address: text("address"),
      maxGuests: integer("max_guests"),
      cateringIncluded: boolean("catering_included").default(false),
      accommodationAvailable: boolean("accommodation_available").default(false),
      checkoutTime: text("checkout_time"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vendorVenueAvailability = pgTable(
      "vendor_venue_availability",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
        date: text("date").notNull(),
        // Stored as dd.MM.yyyy for UI compatibility
        status: text("status").notNull().default("available"),
        // available | blocked | limited
        maxBookings: integer("max_bookings"),
        notes: text("notes"),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow()
      },
      (table) => ({
        vendorDateIdx: uniqueIndex("idx_vendor_venue_availability_vendor_date").on(table.vendorId, table.date),
        vendorIdx: index("idx_vendor_venue_availability_vendor").on(table.vendorId),
        dateIdx: index("idx_vendor_venue_availability_date").on(table.date)
      })
    );
    vendorVenueTimelines = pgTable("vendor_venue_timelines", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }).unique(),
      siteVisitDone: boolean("site_visit_done").default(false),
      contractSigned: boolean("contract_signed").default(false),
      depositReceived: boolean("deposit_received").default(false),
      floorPlanFinalized: boolean("floor_plan_finalized").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertCoupleVenueBookingSchema = createInsertSchema(coupleVenueBookings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCoupleVenueTimelineSchema = createInsertSchema(coupleVenueTimelines).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorVenueBookingSchema = createInsertSchema(vendorVenueBookings).omit({
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorVenueAvailabilitySchema = createInsertSchema(vendorVenueAvailability).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorVenueTimelineSchema = createInsertSchema(vendorVenueTimelines).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    vendorOffers = pgTable("vendor_offers", {
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
    vendorOfferItems = pgTable("vendor_offer_items", {
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
    insertVendorOfferSchema = createInsertSchema(vendorOffers).omit({
      id: true,
      status: true,
      acceptedAt: true,
      declinedAt: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorOfferItemSchema = createInsertSchema(vendorOfferItems).omit({
      id: true,
      createdAt: true
    });
    createOfferSchema = z.object({
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
    speeches = pgTable("speeches", {
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
    insertSpeechSchema = createInsertSchema(speeches).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    createSpeechSchema = z.object({
      speakerName: z.string().min(1, "Navn er p\xE5krevd"),
      role: z.string().optional(),
      durationMinutes: z.number().min(1).max(60).default(5),
      sortOrder: z.number().default(0),
      notes: z.string().optional(),
      scheduledTime: z.string().optional()
    });
    messageReminders = pgTable("message_reminders", {
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
    appSettings = pgTable("app_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      category: text("category").notNull().default("general"),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertAppSettingSchema = createInsertSchema(appSettings).omit({
      id: true,
      updatedAt: true
    });
    updateAppSettingSchema = z.object({
      value: z.string().min(1, "Verdi er p\xE5krevd")
    });
    whatsNewItems = pgTable("whats_new_items", {
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
    insertWhatsNewSchema = createInsertSchema(whatsNewItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      category: z.enum(["vendor", "couple"]).default("vendor")
    });
    updateWhatsNewSchema = z.object({
      category: z.enum(["vendor", "couple"]).default("vendor"),
      title: z.string().min(1, "Tittel er p\xE5krevd"),
      description: z.string().min(1, "Beskrivelse er p\xE5krevd"),
      icon: z.string().default("star"),
      minAppVersion: z.string().min(1, "Minimumversjon er p\xE5krevd"),
      isActive: z.boolean(),
      sortOrder: z.number().int()
    });
    scheduleEvents = pgTable("schedule_events", {
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
    insertScheduleEventSchema = createInsertSchema(scheduleEvents).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    coordinatorInvitations = pgTable("coordinator_invitations", {
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
    insertCoordinatorInvitationSchema = createInsertSchema(coordinatorInvitations).omit({
      id: true,
      accessToken: true,
      accessCode: true,
      status: true,
      lastAccessedAt: true,
      createdAt: true,
      updatedAt: true
    });
    createCoordinatorInvitationSchema = z.object({
      name: z.string().min(1, "Navn er p\xE5krevd"),
      email: z.string().email().optional().or(z.literal("")),
      roleLabel: z.string().default("Toastmaster"),
      canViewSpeeches: z.boolean().default(true),
      canViewSchedule: z.boolean().default(true),
      canEditSpeeches: z.boolean().default(false),
      canEditSchedule: z.boolean().default(false),
      expiresAt: z.string().optional()
    });
    guestInvitations = pgTable("guest_invitations", {
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
    insertGuestInvitationSchema = createInsertSchema(guestInvitations).omit({
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
    createGuestInvitationSchema = z.object({
      name: z.string().min(1, "Navn er p\xE5krevd"),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional().or(z.literal("")),
      template: z.enum(["classic", "floral", "modern"]).default("classic"),
      message: z.string().optional().or(z.literal("")),
      expiresAt: z.string().optional()
    });
    coupleVendorContracts = pgTable("couple_vendor_contracts", {
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
    insertCoupleVendorContractSchema = createInsertSchema(coupleVendorContracts).omit({
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true
    });
    notifications = pgTable("notifications", {
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
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      readAt: true,
      createdAt: true
    });
    activityLogs = pgTable("activity_logs", {
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
    weddingGuests = pgTable("wedding_guests", {
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
    insertWeddingGuestSchema = createInsertSchema(weddingGuests).omit({
      id: true,
      coupleId: true,
      createdAt: true,
      updatedAt: true
    });
    updateWeddingGuestSchema = insertWeddingGuestSchema.partial();
    weddingTables = pgTable("wedding_tables", {
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
    insertWeddingTableSchema = createInsertSchema(weddingTables).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    tableGuestAssignments = pgTable("table_guest_assignments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      tableId: varchar("table_id").notNull().references(() => weddingTables.id, { onDelete: "cascade" }),
      guestId: varchar("guest_id").notNull().references(() => weddingGuests.id, { onDelete: "cascade" }),
      seatNumber: integer("seat_number"),
      createdAt: timestamp("created_at").defaultNow()
    });
    tableSeatingInvitations = pgTable("table_seating_invitations", {
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
    insertTableSeatingInvitationSchema = createInsertSchema(tableSeatingInvitations).omit({
      id: true,
      accessToken: true,
      accessCode: true,
      status: true,
      lastAccessedAt: true,
      createdAt: true,
      updatedAt: true
    });
    appFeedback = pgTable("app_feedback", {
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
    insertAppFeedbackSchema = createInsertSchema(appFeedback).omit({
      id: true,
      status: true,
      adminNotes: true,
      createdAt: true,
      updatedAt: true
    });
    vendorReviews = pgTable("vendor_reviews", {
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
    insertVendorReviewSchema = createInsertSchema(vendorReviews).omit({
      id: true,
      isApproved: true,
      approvedAt: true,
      approvedBy: true,
      editableUntil: true,
      createdAt: true,
      updatedAt: true
    });
    vendorReviewResponses = pgTable("vendor_review_responses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      reviewId: varchar("review_id").notNull().references(() => vendorReviews.id, { onDelete: "cascade" }),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
      body: text("body").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertVendorReviewResponseSchema = createInsertSchema(vendorReviewResponses).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    faqItems = pgTable("faq_items", {
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
    insertFaqItemSchema = createInsertSchema(faqItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateFaqItemSchema = z.object({
      category: z.enum(["couple", "vendor"]).optional(),
      icon: z.string().optional(),
      question: z.string().optional(),
      answer: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional()
    });
    videoGuides = pgTable("video_guides", {
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
    insertVideoGuideSchema = createInsertSchema(videoGuides).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      category: z.enum(["vendor", "couple"]).default("vendor")
    });
    updateVideoGuideSchema = z.object({
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
    subscriptionTiers = pgTable("subscription_tiers", {
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
      // Gallery/showcase photos
      maxProducts: integer("max_products").notNull().default(5),
      // Product catalog items
      maxMonthlyOffers: integer("max_monthly_offers").notNull().default(10),
      // Offers to couples per month
      maxMonthlyDeliveries: integer("max_monthly_deliveries").notNull().default(5),
      // Deliveries per month
      maxStorageGb: integer("max_storage_gb").notNull().default(5),
      // File storage limit
      // Features
      canSendMessages: boolean("can_send_messages").notNull().default(true),
      // Chat with couples
      canReceiveInquiries: boolean("can_receive_inquiries").notNull().default(true),
      // Get contacted by couples
      canCreateOffers: boolean("can_create_offers").notNull().default(true),
      // Send quotes/offers
      canCreateDeliveries: boolean("can_create_deliveries").notNull().default(true),
      // Upload deliveries
      canShowcaseWork: boolean("can_showcase_work").notNull().default(true),
      // Post inspirations
      hasAdvancedAnalytics: boolean("has_advanced_analytics").notNull().default(false),
      hasPrioritizedSearch: boolean("has_prioritized_search").notNull().default(false),
      canHighlightProfile: boolean("can_highlight_profile").notNull().default(false),
      // Featured placement
      canUseVideoGallery: boolean("can_use_video_gallery").notNull().default(false),
      // Video uploads
      hasReviewBadge: boolean("has_review_badge").notNull().default(false),
      // Premium badge
      hasMultipleCategories: boolean("has_multiple_categories").notNull().default(false),
      // List in multiple categories
      // Pricing adjustments
      commissionPercentage: integer("commission_percentage").notNull().default(3),
      // 3% = 300 basis points
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vendorSubscriptions = pgTable("vendor_subscriptions", {
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
    vendorUsageMetrics = pgTable("vendor_usage_metrics", {
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
    vendorPayments = pgTable("vendor_payments", {
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
    insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateSubscriptionTierSchema = z.object({
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
    insertVendorSubscriptionSchema = createInsertSchema(vendorSubscriptions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorUsageSchema = createInsertSchema(vendorUsageMetrics).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorPaymentSchema = createInsertSchema(vendorPayments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    coupleHairMakeupAppointments = pgTable("couple_hair_makeup_appointments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      stylistName: text("stylist_name").notNull(),
      serviceType: text("service_type").notNull(),
      // "hair", "makeup", "both"
      appointmentType: text("appointment_type").notNull(),
      // "consultation", "trial", "wedding_day"
      date: text("date").notNull(),
      time: text("time"),
      location: text("location"),
      notes: text("notes"),
      completed: boolean("completed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleHairMakeupLooks = pgTable("couple_hair_makeup_looks", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      lookType: text("look_type").notNull(),
      // "hair", "makeup", "full_look"
      imageUrl: text("image_url"),
      notes: text("notes"),
      isFavorite: boolean("is_favorite").default(false),
      isSelected: boolean("is_selected").default(false),
      // the chosen look
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleHairMakeupTimeline = pgTable("couple_hair_makeup_timeline", {
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleTransportBookings = pgTable("couple_transport_bookings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      vehicleType: text("vehicle_type").notNull(),
      // "bride_car", "groom_car", "guest_shuttle", "getaway_car"
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleTransportTimeline = pgTable("couple_transport_timeline", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
      brideCarBooked: boolean("bride_car_booked").default(false),
      groomCarBooked: boolean("groom_car_booked").default(false),
      guestShuttleBooked: boolean("guest_shuttle_booked").default(false),
      getawayCarBooked: boolean("getaway_car_booked").default(false),
      allConfirmed: boolean("all_confirmed").default(false),
      budget: integer("budget").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleFlowerAppointments = pgTable("couple_flower_appointments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      floristName: text("florist_name").notNull(),
      appointmentType: text("appointment_type").notNull(),
      // "consultation", "mockup", "delivery_planning"
      date: text("date").notNull(),
      time: text("time"),
      location: text("location"),
      notes: text("notes"),
      completed: boolean("completed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleFlowerSelections = pgTable("couple_flower_selections", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      itemType: text("item_type").notNull(),
      // "bridal_bouquet", "bridesmaid_bouquet", "boutonniere", "centerpiece", "ceremony_flowers", "other"
      name: text("name").notNull(),
      description: text("description"),
      imageUrl: text("image_url"),
      quantity: integer("quantity").default(1),
      estimatedPrice: integer("estimated_price").default(0),
      isConfirmed: boolean("is_confirmed").default(false),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleFlowerTimeline = pgTable("couple_flower_timeline", {
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    couplePhotographerSessions = pgTable("couple_photographer_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      date: text("date").notNull(),
      time: text("time"),
      location: text("location"),
      duration: text("duration"),
      photographerName: text("photographer_name"),
      notes: text("notes"),
      completed: boolean("completed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    couplePhotographerShots = pgTable("couple_photographer_shots", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      description: text("description"),
      category: text("category"),
      isSelected: boolean("is_selected").default(false),
      priority: integer("priority"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    couplePhotographerTimeline = pgTable("couple_photographer_timeline", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
      photographerSelected: boolean("photographer_selected").default(false),
      sessionBooked: boolean("session_booked").default(false),
      contractSigned: boolean("contract_signed").default(false),
      depositPaid: boolean("deposit_paid").default(false),
      budget: integer("budget").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleVideographerSessions = pgTable("couple_videographer_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      date: text("date").notNull(),
      time: text("time"),
      location: text("location"),
      duration: text("duration"),
      videographerName: text("videographer_name"),
      notes: text("notes"),
      completed: boolean("completed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleVideographerDeliverables = pgTable("couple_videographer_deliverables", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      description: text("description"),
      format: text("format"),
      duration: text("duration"),
      isConfirmed: boolean("is_confirmed").default(false),
      deliveryDate: text("delivery_date"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleVideographerTimeline = pgTable("couple_videographer_timeline", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
      videographerSelected: boolean("videographer_selected").default(false),
      sessionBooked: boolean("session_booked").default(false),
      contractSigned: boolean("contract_signed").default(false),
      depositPaid: boolean("deposit_paid").default(false),
      budget: integer("budget").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleMusicPerformances = pgTable("couple_music_performances", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      date: text("date").notNull(),
      time: text("time"),
      duration: text("duration"),
      musicianName: text("musician_name"),
      performanceType: text("performance_type"),
      notes: text("notes"),
      completed: boolean("completed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleMusicSetlists = pgTable("couple_music_setlists", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      songs: text("songs"),
      genre: text("genre"),
      duration: text("duration"),
      mood: text("mood"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleMusicTimeline = pgTable("couple_music_timeline", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }).unique(),
      musicianSelected: boolean("musician_selected").default(false),
      setlistDiscussed: boolean("setlist_discussed").default(false),
      contractSigned: boolean("contract_signed").default(false),
      depositPaid: boolean("deposit_paid").default(false),
      budget: integer("budget").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleCateringTastings = pgTable("couple_catering_tastings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      catererName: text("caterer_name").notNull(),
      date: text("date").notNull(),
      time: text("time"),
      location: text("location"),
      notes: text("notes"),
      rating: integer("rating"),
      // 1-5 stars
      completed: boolean("completed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleCateringMenu = pgTable("couple_catering_menu", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      courseType: text("course_type").notNull(),
      // "appetizer", "main", "dessert", "drinks", "late_night"
      dishName: text("dish_name").notNull(),
      description: text("description"),
      isVegetarian: boolean("is_vegetarian").default(false),
      isVegan: boolean("is_vegan").default(false),
      isGlutenFree: boolean("is_gluten_free").default(false),
      isSelected: boolean("is_selected").default(false),
      pricePerPerson: integer("price_per_person").default(0),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleCateringDietaryNeeds = pgTable("couple_catering_dietary_needs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      guestName: text("guest_name").notNull(),
      dietaryType: text("dietary_type").notNull(),
      // "vegetarian", "vegan", "gluten_free", "nut_allergy", "lactose_intolerant", "halal", "kosher", "other"
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleCateringTimeline = pgTable("couple_catering_timeline", {
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleCakeTastings = pgTable("couple_cake_tastings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      bakeryName: text("bakery_name").notNull(),
      date: text("date").notNull(),
      time: text("time"),
      location: text("location"),
      flavorsToTry: text("flavors_to_try"),
      // comma-separated
      notes: text("notes"),
      rating: integer("rating"),
      // 1-5 stars
      completed: boolean("completed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleCakeDesigns = pgTable("couple_cake_designs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      coupleId: varchar("couple_id").notNull().references(() => coupleProfiles.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      imageUrl: text("image_url"),
      tiers: integer("tiers").default(3),
      flavor: text("flavor"),
      filling: text("filling"),
      frosting: text("frosting"),
      // "buttercream", "fondant", "naked", "ganache"
      style: text("style"),
      // "classic", "modern", "rustic", "floral", "minimalist"
      estimatedPrice: integer("estimated_price").default(0),
      estimatedServings: integer("estimated_servings"),
      isFavorite: boolean("is_favorite").default(false),
      isSelected: boolean("is_selected").default(false),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    coupleCakeTimeline = pgTable("couple_cake_timeline", {
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    creatorhubProjects = pgTable("creatorhub_projects", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      slug: text("slug").notNull().unique(),
      // URL-friendly project identifier
      description: text("description"),
      logoUrl: text("logo_url"),
      ownerId: varchar("owner_id").notNull(),
      // references creatorhubUsers.id (set after first user created)
      status: text("status").notNull().default("active"),
      // active, archived, suspended
      // API access
      apiKey: text("api_key").notNull().unique(),
      // For external API calls
      apiKeyPrefix: text("api_key_prefix").notNull(),
      // First 8 chars for display (ch_xxxx...)
      webhookUrl: text("webhook_url"),
      // Callback URL for events
      webhookSecret: text("webhook_secret"),
      // HMAC secret for webhook signing
      // Settings
      defaultTimezone: text("default_timezone").default("Europe/Oslo"),
      defaultCurrency: text("default_currency").default("NOK"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    creatorhubUsers = pgTable("creatorhub_users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      projectId: varchar("project_id").notNull().references(() => creatorhubProjects.id, { onDelete: "cascade" }),
      vendorId: varchar("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
      // Link to Wedflow vendor
      email: text("email").notNull(),
      displayName: text("display_name").notNull(),
      avatarUrl: text("avatar_url"),
      role: text("role").notNull().default("creator"),
      // owner, admin, creator, viewer
      status: text("status").notNull().default("active"),
      // active, suspended, deactivated
      lastLoginAt: timestamp("last_login_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      projectEmailIdx: uniqueIndex("idx_creatorhub_users_project_email").on(table.projectId, table.email)
    }));
    creatorhubInvitations = pgTable("creatorhub_invitations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      projectId: varchar("project_id").notNull().references(() => creatorhubProjects.id, { onDelete: "cascade" }),
      invitedBy: varchar("invited_by").notNull().references(() => creatorhubUsers.id, { onDelete: "cascade" }),
      email: text("email").notNull(),
      role: text("role").notNull().default("creator"),
      // admin, creator, viewer
      token: text("token").notNull().unique(),
      // Unique invite token
      message: text("message"),
      // Personal invite message
      status: text("status").notNull().default("pending"),
      // pending, accepted, expired, revoked
      acceptedAt: timestamp("accepted_at"),
      acceptedUserId: varchar("accepted_user_id").references(() => creatorhubUsers.id, { onDelete: "set null" }),
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    creatorhubBookings = pgTable("creatorhub_bookings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      projectId: varchar("project_id").notNull().references(() => creatorhubProjects.id, { onDelete: "cascade" }),
      creatorUserId: varchar("creator_user_id").notNull().references(() => creatorhubUsers.id, { onDelete: "cascade" }),
      // Link to Wedflow entities
      vendorId: varchar("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
      coupleId: varchar("couple_id").references(() => coupleProfiles.id, { onDelete: "set null" }),
      conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
      offerId: varchar("offer_id").references(() => vendorOffers.id, { onDelete: "set null" }),
      // Booking details
      title: text("title").notNull(),
      description: text("description"),
      clientName: text("client_name").notNull(),
      clientEmail: text("client_email"),
      clientPhone: text("client_phone"),
      eventDate: date("event_date").notNull(),
      eventTime: text("event_time"),
      // HH:mm
      eventEndTime: text("event_end_time"),
      // HH:mm
      location: text("location"),
      // Financial
      totalAmount: integer("total_amount"),
      // In øre (cents)
      depositAmount: integer("deposit_amount"),
      depositPaid: boolean("deposit_paid").default(false),
      fullPaid: boolean("full_paid").default(false),
      currency: text("currency").default("NOK"),
      // Status
      status: text("status").notNull().default("confirmed"),
      // inquiry, confirmed, completed, cancelled
      notes: text("notes"),
      internalNotes: text("internal_notes"),
      // Not shared with client
      // Metadata
      tags: text("tags").array(),
      // free-form tags for filtering
      externalRef: text("external_ref"),
      // Reference from external system
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      projectDateIdx: index("idx_creatorhub_bookings_project_date").on(table.projectId, table.eventDate),
      creatorIdx: index("idx_creatorhub_bookings_creator").on(table.creatorUserId)
    }));
    creatorhubCrmNotes = pgTable("creatorhub_crm_notes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      projectId: varchar("project_id").notNull().references(() => creatorhubProjects.id, { onDelete: "cascade" }),
      bookingId: varchar("booking_id").references(() => creatorhubBookings.id, { onDelete: "cascade" }),
      creatorUserId: varchar("creator_user_id").notNull().references(() => creatorhubUsers.id, { onDelete: "cascade" }),
      // Link to Wedflow conversation for shared messaging
      conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
      // CRM note
      noteType: text("note_type").notNull().default("note"),
      // note, call_log, email_log, task, follow_up
      subject: text("subject"),
      body: text("body").notNull(),
      dueDate: timestamp("due_date"),
      // For tasks/follow-ups
      isCompleted: boolean("is_completed").default(false),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    creatorhubAnalyticsEvents = pgTable("creatorhub_analytics_events", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      projectId: varchar("project_id").notNull().references(() => creatorhubProjects.id, { onDelete: "cascade" }),
      creatorUserId: varchar("creator_user_id").references(() => creatorhubUsers.id, { onDelete: "set null" }),
      bookingId: varchar("booking_id").references(() => creatorhubBookings.id, { onDelete: "set null" }),
      // Event data
      eventType: text("event_type").notNull(),
      // booking_created, booking_completed, payment_received, message_sent, etc.
      eventData: text("event_data"),
      // JSON payload with event-specific data
      // Attribution
      source: text("source").default("creatorhub"),
      // creatorhub, wedflow, api, webhook
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => ({
      projectTypeIdx: index("idx_creatorhub_analytics_project_type").on(table.projectId, table.eventType),
      createdAtIdx: index("idx_creatorhub_analytics_created_at").on(table.createdAt)
    }));
    creatorhubApiAuditLog = pgTable("creatorhub_api_audit_log", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      projectId: varchar("project_id").notNull().references(() => creatorhubProjects.id, { onDelete: "cascade" }),
      userId: varchar("user_id").references(() => creatorhubUsers.id, { onDelete: "set null" }),
      method: text("method").notNull(),
      // GET, POST, PUT, DELETE
      path: text("path").notNull(),
      statusCode: integer("status_code"),
      requestBody: text("request_body"),
      // Truncated request body
      responseTime: integer("response_time"),
      // ms
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow()
    });
    createCreatorhubProjectSchema = z.object({
      name: z.string().min(2, "Project name must be at least 2 characters"),
      slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
      description: z.string().optional(),
      logoUrl: z.string().url().optional().or(z.literal("")),
      defaultTimezone: z.string().default("Europe/Oslo"),
      defaultCurrency: z.string().default("NOK")
    });
    createCreatorhubInvitationSchema = z.object({
      email: z.string().email("Invalid email address"),
      role: z.enum(["admin", "creator", "viewer"]).default("creator"),
      message: z.string().max(500).optional()
    });
    createCreatorhubBookingSchema = z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      clientName: z.string().min(1, "Client name is required"),
      clientEmail: z.string().email().optional().or(z.literal("")),
      clientPhone: z.string().optional(),
      eventDate: z.string().min(1, "Event date is required"),
      eventTime: z.string().optional(),
      eventEndTime: z.string().optional(),
      location: z.string().optional(),
      totalAmount: z.number().int().min(0).optional(),
      depositAmount: z.number().int().min(0).optional(),
      status: z.enum(["inquiry", "confirmed", "completed", "cancelled"]).default("confirmed"),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
      tags: z.array(z.string()).optional(),
      externalRef: z.string().optional(),
      // Optional Wedflow links
      vendorId: z.string().optional(),
      coupleId: z.string().optional(),
      conversationId: z.string().optional(),
      offerId: z.string().optional()
    });
    createCreatorhubCrmNoteSchema = z.object({
      bookingId: z.string().optional(),
      conversationId: z.string().optional(),
      noteType: z.enum(["note", "call_log", "email_log", "task", "follow_up"]).default("note"),
      subject: z.string().optional(),
      body: z.string().min(1, "Note body is required"),
      dueDate: z.string().optional()
    });
  }
});

// server/index.ts
import "dotenv/config";
import express from "express";

// server/routes.ts
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import crypto3 from "node:crypto";

// server/db.ts
init_schema();
import "dotenv/config";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
config({ path: ".env.local", override: true });
var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// server/routes.ts
import bcrypt from "bcryptjs";

// server/subscription-routes.ts
init_schema();
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
        multiple_categories: tier.hasMultipleCategories
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
        maxProducts: tier?.maxProducts ?? 5,
        maxMonthlyOffers: tier?.maxMonthlyOffers ?? 10,
        maxMonthlyDeliveries: tier?.maxMonthlyDeliveries ?? 5,
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
        products: Math.max(0, limits.maxProducts),
        offers: Math.max(0, limits.maxMonthlyOffers),
        deliveries: Math.max(0, limits.maxMonthlyDeliveries),
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
  app2.delete("/api/admin/subscription/tiers/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }
    try {
      const { id } = req.params;
      const [vendorsUsing] = await db.select({ count: sql2`count(*)` }).from(vendorSubscriptions).where(eq(vendorSubscriptions.tierId, id));
      if (vendorsUsing && vendorsUsing.count > 0) {
        return res.status(400).json({
          error: "Kan ikke slette denne tieren fordi den er i bruk av leverand\xF8rer"
        });
      }
      await db.delete(subscriptionTiers).where(eq(subscriptionTiers.id, id));
      res.json({ success: true, message: "Abonnementstier slettet" });
    } catch (error) {
      console.error("Error deleting tier:", error);
      res.status(400).json({ error: error.message || "Kunne ikke slette abonnement" });
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
      const [subscription] = await db.select().from(vendorSubscriptions).where(eq(vendorSubscriptions.vendorId, vendorId)).limit(1);
      const orderId = `WF-${vendorId.substring(0, 8)}-${Date.now()}`;
      const now = /* @__PURE__ */ new Date();
      const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const [payment] = await db.insert(vendorPayments).values({
        vendorId,
        subscriptionId: subscription?.id,
        // Link to subscription
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
        if (payment.subscriptionId) {
          const now = /* @__PURE__ */ new Date();
          const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          await db.update(vendorSubscriptions).set({
            status: "active",
            // Activate subscription after successful payment
            currentPeriodStart: now,
            currentPeriodEnd: nextBilling,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(vendorSubscriptions.id, payment.subscriptionId));
          console.log(`Subscription ${payment.subscriptionId} activated for vendor ${payment.vendorId}`);
        }
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

// server/creatorhub-routes.ts
import crypto2 from "node:crypto";
init_schema();
import { eq as eq2, and as and2, desc, sql as sql3, gte, lte } from "drizzle-orm";
function generateApiKey() {
  const key = `ch_${crypto2.randomBytes(32).toString("hex")}`;
  const prefix = key.substring(0, 11);
  return { key, prefix };
}
function generateInviteToken() {
  return crypto2.randomBytes(24).toString("base64url");
}
async function authenticateApiKey(req, res, next) {
  const apiKey = req.header("X-API-Key") || extractBearerToken(req);
  if (!apiKey || !apiKey.startsWith("ch_")) {
    return res.status(401).json({ error: "Missing or invalid API key" });
  }
  try {
    const [project] = await db.select().from(creatorhubProjects).where(eq2(creatorhubProjects.apiKey, apiKey));
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
function extractBearerToken(req) {
  const auth = req.header("Authorization");
  if (auth?.startsWith("Bearer ch_")) {
    return auth.substring(7);
  }
  return null;
}
async function auditLog(req, res, next) {
  const startTime = Date.now();
  const originalEnd = res.end.bind(res);
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    if (req.project) {
      db.insert(creatorhubApiAuditLog).values({
        projectId: req.project.id,
        userId: req.creatorhubUser?.id || null,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        requestBody: req.method !== "GET" ? JSON.stringify(req.body).substring(0, 2e3) : null,
        responseTime,
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.header("User-Agent") || null
      }).catch((err) => console.error("[CreatorHub] Audit log error:", err));
    }
    return originalEnd(...args);
  };
  next();
}
function registerCreatorhubRoutes(app2) {
  app2.use("/api/creatorhub", auditLog);
  app2.post("/api/creatorhub/projects", async (req, res) => {
    const adminSecret = req.header("X-Admin-Secret") || req.header("Authorization")?.replace("Bearer ", "");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Admin authentication required" });
    }
    try {
      const parsed = createCreatorhubProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.flatten() });
      }
      const existing = await db.select().from(creatorhubProjects).where(eq2(creatorhubProjects.slug, parsed.data.slug));
      if (existing.length > 0) {
        return res.status(409).json({ error: "Project slug already exists" });
      }
      const { key: apiKey, prefix: apiKeyPrefix } = generateApiKey();
      const webhookSecret = crypto2.randomBytes(32).toString("hex");
      const [project] = await db.insert(creatorhubProjects).values({
        ...parsed.data,
        ownerId: "system",
        // Will be updated when first user is created
        apiKey,
        apiKeyPrefix,
        webhookSecret
      }).returning();
      if (req.body.ownerEmail && req.body.ownerName) {
        const [user] = await db.insert(creatorhubUsers).values({
          projectId: project.id,
          email: req.body.ownerEmail,
          displayName: req.body.ownerName,
          role: "owner",
          vendorId: req.body.vendorId || null
        }).returning();
        await db.update(creatorhubProjects).set({ ownerId: user.id }).where(eq2(creatorhubProjects.id, project.id));
        return res.json({
          project: { ...project, ownerId: user.id },
          apiKey,
          // Show ONCE - store this!
          webhookSecret,
          // Show ONCE - store this!
          owner: user
        });
      }
      return res.json({
        project,
        apiKey,
        // Show ONCE - store this!
        webhookSecret
        // Show ONCE - store this!
      });
    } catch (err) {
      console.error("[CreatorHub] Create project error:", err);
      return res.status(500).json({ error: "Failed to create project" });
    }
  });
  app2.get("/api/creatorhub/projects", async (req, res) => {
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
        createdAt: creatorhubProjects.createdAt
      }).from(creatorhubProjects).orderBy(desc(creatorhubProjects.createdAt));
      return res.json(projects);
    } catch (err) {
      console.error("[CreatorHub] List projects error:", err);
      return res.status(500).json({ error: "Failed to list projects" });
    }
  });
  app2.get("/api/creatorhub/project", authenticateApiKey, async (req, res) => {
    const { apiKey, webhookSecret, ...safeProject } = req.project;
    return res.json(safeProject);
  });
  app2.get("/api/creatorhub/users", authenticateApiKey, async (req, res) => {
    try {
      const users2 = await db.select().from(creatorhubUsers).where(eq2(creatorhubUsers.projectId, req.project.id)).orderBy(desc(creatorhubUsers.createdAt));
      return res.json(users2);
    } catch (err) {
      console.error("[CreatorHub] List users error:", err);
      return res.status(500).json({ error: "Failed to list users" });
    }
  });
  app2.get("/api/creatorhub/users/:id", authenticateApiKey, async (req, res) => {
    try {
      const [user] = await db.select().from(creatorhubUsers).where(and2(
        eq2(creatorhubUsers.id, req.params.id),
        eq2(creatorhubUsers.projectId, req.project.id)
      ));
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
    } catch (err) {
      return res.status(500).json({ error: "Failed to get user" });
    }
  });
  app2.patch("/api/creatorhub/users/:id", authenticateApiKey, async (req, res) => {
    try {
      const { role, status, displayName, avatarUrl, vendorId } = req.body;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (role) updates.role = role;
      if (status) updates.status = status;
      if (displayName) updates.displayName = displayName;
      if (avatarUrl !== void 0) updates.avatarUrl = avatarUrl;
      if (vendorId !== void 0) updates.vendorId = vendorId;
      const [updated] = await db.update(creatorhubUsers).set(updates).where(and2(
        eq2(creatorhubUsers.id, req.params.id),
        eq2(creatorhubUsers.projectId, req.project.id)
      )).returning();
      if (!updated) return res.status(404).json({ error: "User not found" });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  });
  app2.post("/api/creatorhub/invitations", authenticateApiKey, async (req, res) => {
    try {
      const parsed = createCreatorhubInvitationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.flatten() });
      }
      const existingUser = await db.select().from(creatorhubUsers).where(and2(
        eq2(creatorhubUsers.projectId, req.project.id),
        eq2(creatorhubUsers.email, parsed.data.email)
      ));
      if (existingUser.length > 0) {
        return res.status(409).json({ error: "User already exists in this project" });
      }
      const existingInvite = await db.select().from(creatorhubInvitations).where(and2(
        eq2(creatorhubInvitations.projectId, req.project.id),
        eq2(creatorhubInvitations.email, parsed.data.email),
        eq2(creatorhubInvitations.status, "pending")
      ));
      if (existingInvite.length > 0) {
        return res.status(409).json({ error: "Pending invitation already exists for this email" });
      }
      const invitedBy = req.body.invitedByUserId;
      if (!invitedBy) {
        return res.status(400).json({ error: "invitedByUserId is required" });
      }
      const token = generateInviteToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      const [invitation] = await db.insert(creatorhubInvitations).values({
        projectId: req.project.id,
        invitedBy,
        email: parsed.data.email,
        role: parsed.data.role,
        token,
        message: parsed.data.message,
        expiresAt
      }).returning();
      await db.insert(creatorhubAnalyticsEvents).values({
        projectId: req.project.id,
        creatorUserId: invitedBy,
        eventType: "invitation_sent",
        eventData: JSON.stringify({ email: parsed.data.email, role: parsed.data.role }),
        source: "api"
      });
      return res.status(201).json({
        ...invitation,
        inviteUrl: `${process.env.APP_URL || "https://wedflow.no"}/creatorhub/invite/${token}`
      });
    } catch (err) {
      console.error("[CreatorHub] Create invitation error:", err);
      return res.status(500).json({ error: "Failed to create invitation" });
    }
  });
  app2.get("/api/creatorhub/invitations", authenticateApiKey, async (req, res) => {
    try {
      const status = req.query.status;
      const conditions = [eq2(creatorhubInvitations.projectId, req.project.id)];
      if (status) conditions.push(eq2(creatorhubInvitations.status, status));
      const invitations = await db.select().from(creatorhubInvitations).where(and2(...conditions)).orderBy(desc(creatorhubInvitations.createdAt));
      return res.json(invitations);
    } catch (err) {
      return res.status(500).json({ error: "Failed to list invitations" });
    }
  });
  app2.post("/api/creatorhub/invitations/:token/accept", async (req, res) => {
    try {
      const { token } = req.params;
      const { displayName, vendorId } = req.body;
      const [invitation] = await db.select().from(creatorhubInvitations).where(eq2(creatorhubInvitations.token, token));
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      if (invitation.status !== "pending") {
        return res.status(400).json({ error: `Invitation is ${invitation.status}` });
      }
      if (invitation.expiresAt < /* @__PURE__ */ new Date()) {
        await db.update(creatorhubInvitations).set({ status: "expired" }).where(eq2(creatorhubInvitations.id, invitation.id));
        return res.status(400).json({ error: "Invitation has expired" });
      }
      const [user] = await db.insert(creatorhubUsers).values({
        projectId: invitation.projectId,
        email: invitation.email,
        displayName: displayName || invitation.email.split("@")[0],
        role: invitation.role,
        vendorId: vendorId || null
      }).returning();
      await db.update(creatorhubInvitations).set({ status: "accepted", acceptedAt: /* @__PURE__ */ new Date(), acceptedUserId: user.id }).where(eq2(creatorhubInvitations.id, invitation.id));
      await db.insert(creatorhubAnalyticsEvents).values({
        projectId: invitation.projectId,
        creatorUserId: user.id,
        eventType: "invitation_accepted",
        eventData: JSON.stringify({ role: invitation.role }),
        source: "api"
      });
      return res.json({ user, projectId: invitation.projectId });
    } catch (err) {
      console.error("[CreatorHub] Accept invitation error:", err);
      return res.status(500).json({ error: "Failed to accept invitation" });
    }
  });
  app2.delete("/api/creatorhub/invitations/:id", authenticateApiKey, async (req, res) => {
    try {
      const [updated] = await db.update(creatorhubInvitations).set({ status: "revoked" }).where(and2(
        eq2(creatorhubInvitations.id, req.params.id),
        eq2(creatorhubInvitations.projectId, req.project.id),
        eq2(creatorhubInvitations.status, "pending")
      )).returning();
      if (!updated) return res.status(404).json({ error: "Pending invitation not found" });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to revoke invitation" });
    }
  });
  app2.get("/api/creatorhub/bookings", authenticateApiKey, async (req, res) => {
    try {
      const { status, creatorUserId, from, to } = req.query;
      const conditions = [eq2(creatorhubBookings.projectId, req.project.id)];
      if (status) conditions.push(eq2(creatorhubBookings.status, status));
      if (creatorUserId) conditions.push(eq2(creatorhubBookings.creatorUserId, creatorUserId));
      if (from) conditions.push(gte(creatorhubBookings.eventDate, from));
      if (to) conditions.push(lte(creatorhubBookings.eventDate, to));
      const bookings = await db.select().from(creatorhubBookings).where(and2(...conditions)).orderBy(desc(creatorhubBookings.eventDate));
      return res.json(bookings);
    } catch (err) {
      console.error("[CreatorHub] List bookings error:", err);
      return res.status(500).json({ error: "Failed to list bookings" });
    }
  });
  app2.get("/api/creatorhub/bookings/:id", authenticateApiKey, async (req, res) => {
    try {
      const [booking] = await db.select().from(creatorhubBookings).where(and2(
        eq2(creatorhubBookings.id, req.params.id),
        eq2(creatorhubBookings.projectId, req.project.id)
      ));
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      let wedflowData = {};
      if (booking.vendorId) {
        const [vendor] = await db.select({
          id: vendors.id,
          businessName: vendors.businessName,
          email: vendors.email
        }).from(vendors).where(eq2(vendors.id, booking.vendorId));
        wedflowData.vendor = vendor || null;
      }
      if (booking.coupleId) {
        const [couple] = await db.select({
          id: coupleProfiles.id,
          displayName: coupleProfiles.displayName,
          email: coupleProfiles.email
        }).from(coupleProfiles).where(eq2(coupleProfiles.id, booking.coupleId));
        wedflowData.couple = couple || null;
      }
      return res.json({ ...booking, wedflow: wedflowData });
    } catch (err) {
      return res.status(500).json({ error: "Failed to get booking" });
    }
  });
  app2.post("/api/creatorhub/bookings", authenticateApiKey, async (req, res) => {
    try {
      const parsed = createCreatorhubBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.flatten() });
      }
      if (!req.body.creatorUserId) {
        return res.status(400).json({ error: "creatorUserId is required" });
      }
      const [creator] = await db.select().from(creatorhubUsers).where(and2(
        eq2(creatorhubUsers.id, req.body.creatorUserId),
        eq2(creatorhubUsers.projectId, req.project.id)
      ));
      if (!creator) {
        return res.status(400).json({ error: "Creator user not found in this project" });
      }
      const [booking] = await db.insert(creatorhubBookings).values({
        projectId: req.project.id,
        creatorUserId: req.body.creatorUserId,
        ...parsed.data
      }).returning();
      await db.insert(creatorhubAnalyticsEvents).values({
        projectId: req.project.id,
        creatorUserId: req.body.creatorUserId,
        bookingId: booking.id,
        eventType: "booking_created",
        eventData: JSON.stringify({ status: parsed.data.status, eventDate: parsed.data.eventDate }),
        source: "api"
      });
      return res.status(201).json(booking);
    } catch (err) {
      console.error("[CreatorHub] Create booking error:", err);
      return res.status(500).json({ error: "Failed to create booking" });
    }
  });
  app2.patch("/api/creatorhub/bookings/:id", authenticateApiKey, async (req, res) => {
    try {
      const allowedFields = [
        "title",
        "description",
        "clientName",
        "clientEmail",
        "clientPhone",
        "eventDate",
        "eventTime",
        "eventEndTime",
        "location",
        "totalAmount",
        "depositAmount",
        "depositPaid",
        "fullPaid",
        "status",
        "notes",
        "internalNotes",
        "tags",
        "externalRef",
        "vendorId",
        "coupleId",
        "conversationId",
        "offerId"
      ];
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      for (const field of allowedFields) {
        if (req.body[field] !== void 0) {
          updates[field] = req.body[field];
        }
      }
      const [updated] = await db.update(creatorhubBookings).set(updates).where(and2(
        eq2(creatorhubBookings.id, req.params.id),
        eq2(creatorhubBookings.projectId, req.project.id)
      )).returning();
      if (!updated) return res.status(404).json({ error: "Booking not found" });
      if (req.body.status) {
        await db.insert(creatorhubAnalyticsEvents).values({
          projectId: req.project.id,
          creatorUserId: updated.creatorUserId,
          bookingId: updated.id,
          eventType: `booking_${req.body.status}`,
          eventData: JSON.stringify({ previousStatus: "unknown", newStatus: req.body.status }),
          source: "api"
        });
      }
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update booking" });
    }
  });
  app2.delete("/api/creatorhub/bookings/:id", authenticateApiKey, async (req, res) => {
    try {
      const [deleted] = await db.delete(creatorhubBookings).where(and2(
        eq2(creatorhubBookings.id, req.params.id),
        eq2(creatorhubBookings.projectId, req.project.id)
      )).returning();
      if (!deleted) return res.status(404).json({ error: "Booking not found" });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete booking" });
    }
  });
  app2.get("/api/creatorhub/crm/notes", authenticateApiKey, async (req, res) => {
    try {
      const { bookingId, creatorUserId, noteType } = req.query;
      const conditions = [eq2(creatorhubCrmNotes.projectId, req.project.id)];
      if (bookingId) conditions.push(eq2(creatorhubCrmNotes.bookingId, bookingId));
      if (creatorUserId) conditions.push(eq2(creatorhubCrmNotes.creatorUserId, creatorUserId));
      if (noteType) conditions.push(eq2(creatorhubCrmNotes.noteType, noteType));
      const notes = await db.select().from(creatorhubCrmNotes).where(and2(...conditions)).orderBy(desc(creatorhubCrmNotes.createdAt));
      return res.json(notes);
    } catch (err) {
      return res.status(500).json({ error: "Failed to list CRM notes" });
    }
  });
  app2.post("/api/creatorhub/crm/notes", authenticateApiKey, async (req, res) => {
    try {
      const parsed = createCreatorhubCrmNoteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.flatten() });
      }
      if (!req.body.creatorUserId) {
        return res.status(400).json({ error: "creatorUserId is required" });
      }
      const [note] = await db.insert(creatorhubCrmNotes).values({
        projectId: req.project.id,
        creatorUserId: req.body.creatorUserId,
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null
      }).returning();
      return res.status(201).json(note);
    } catch (err) {
      console.error("[CreatorHub] Create CRM note error:", err);
      return res.status(500).json({ error: "Failed to create CRM note" });
    }
  });
  app2.patch("/api/creatorhub/crm/notes/:id", authenticateApiKey, async (req, res) => {
    try {
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (req.body.subject !== void 0) updates.subject = req.body.subject;
      if (req.body.body !== void 0) updates.body = req.body.body;
      if (req.body.isCompleted !== void 0) {
        updates.isCompleted = req.body.isCompleted;
        updates.completedAt = req.body.isCompleted ? /* @__PURE__ */ new Date() : null;
      }
      if (req.body.dueDate !== void 0) updates.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
      const [updated] = await db.update(creatorhubCrmNotes).set(updates).where(and2(
        eq2(creatorhubCrmNotes.id, req.params.id),
        eq2(creatorhubCrmNotes.projectId, req.project.id)
      )).returning();
      if (!updated) return res.status(404).json({ error: "CRM note not found" });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update CRM note" });
    }
  });
  app2.delete("/api/creatorhub/crm/notes/:id", authenticateApiKey, async (req, res) => {
    try {
      const [deleted] = await db.delete(creatorhubCrmNotes).where(and2(
        eq2(creatorhubCrmNotes.id, req.params.id),
        eq2(creatorhubCrmNotes.projectId, req.project.id)
      )).returning();
      if (!deleted) return res.status(404).json({ error: "CRM note not found" });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete CRM note" });
    }
  });
  app2.get("/api/creatorhub/wedflow/conversations", authenticateApiKey, async (req, res) => {
    try {
      const { vendorId } = req.query;
      if (!vendorId) {
        return res.status(400).json({ error: "vendorId query param required" });
      }
      const [creator] = await db.select().from(creatorhubUsers).where(and2(
        eq2(creatorhubUsers.projectId, req.project.id),
        eq2(creatorhubUsers.vendorId, vendorId)
      ));
      if (!creator) {
        return res.status(403).json({ error: "Vendor not linked to this project" });
      }
      const convos = await db.select().from(conversations).where(eq2(conversations.vendorId, vendorId)).orderBy(desc(conversations.lastMessageAt));
      return res.json(convos);
    } catch (err) {
      return res.status(500).json({ error: "Failed to list conversations" });
    }
  });
  app2.get("/api/creatorhub/wedflow/conversations/:id/messages", authenticateApiKey, async (req, res) => {
    try {
      const [convo] = await db.select().from(conversations).where(eq2(conversations.id, req.params.id));
      if (!convo) return res.status(404).json({ error: "Conversation not found" });
      const [creator] = await db.select().from(creatorhubUsers).where(and2(
        eq2(creatorhubUsers.projectId, req.project.id),
        eq2(creatorhubUsers.vendorId, convo.vendorId)
      ));
      if (!creator) return res.status(403).json({ error: "Conversation not accessible from this project" });
      const msgs = await db.select().from(messages).where(eq2(messages.conversationId, req.params.id)).orderBy(desc(messages.createdAt));
      return res.json(msgs);
    } catch (err) {
      return res.status(500).json({ error: "Failed to get messages" });
    }
  });
  app2.get("/api/creatorhub/wedflow/offers", authenticateApiKey, async (req, res) => {
    try {
      const { vendorId, status } = req.query;
      if (!vendorId) return res.status(400).json({ error: "vendorId query param required" });
      const [creator] = await db.select().from(creatorhubUsers).where(and2(
        eq2(creatorhubUsers.projectId, req.project.id),
        eq2(creatorhubUsers.vendorId, vendorId)
      ));
      if (!creator) return res.status(403).json({ error: "Vendor not linked to this project" });
      const conditions = [eq2(vendorOffers.vendorId, vendorId)];
      if (status) conditions.push(eq2(vendorOffers.status, status));
      const offers = await db.select().from(vendorOffers).where(and2(...conditions)).orderBy(desc(vendorOffers.createdAt));
      return res.json(offers);
    } catch (err) {
      return res.status(500).json({ error: "Failed to list offers" });
    }
  });
  app2.get("/api/creatorhub/analytics/summary", authenticateApiKey, async (req, res) => {
    try {
      const { from, to } = req.query;
      const bookingStats = await db.select({
        total: sql3`count(*)::int`,
        confirmed: sql3`count(*) filter (where status = 'confirmed')::int`,
        completed: sql3`count(*) filter (where status = 'completed')::int`,
        cancelled: sql3`count(*) filter (where status = 'cancelled')::int`,
        totalRevenue: sql3`coalesce(sum(total_amount) filter (where status in ('confirmed', 'completed')), 0)::int`,
        avgBookingValue: sql3`coalesce(avg(total_amount) filter (where total_amount > 0), 0)::int`
      }).from(creatorhubBookings).where(eq2(creatorhubBookings.projectId, req.project.id));
      const userStats = await db.select({
        totalUsers: sql3`count(*)::int`,
        activeUsers: sql3`count(*) filter (where status = 'active')::int`,
        creators: sql3`count(*) filter (where role = 'creator')::int`
      }).from(creatorhubUsers).where(eq2(creatorhubUsers.projectId, req.project.id));
      const inviteStats = await db.select({
        pending: sql3`count(*) filter (where status = 'pending')::int`,
        accepted: sql3`count(*) filter (where status = 'accepted')::int`
      }).from(creatorhubInvitations).where(eq2(creatorhubInvitations.projectId, req.project.id));
      const recentEventCount = await db.select({
        count: sql3`count(*)::int`
      }).from(creatorhubAnalyticsEvents).where(and2(
        eq2(creatorhubAnalyticsEvents.projectId, req.project.id),
        gte(creatorhubAnalyticsEvents.createdAt, sql3`now() - interval '30 days'`)
      ));
      return res.json({
        bookings: bookingStats[0] || {},
        users: userStats[0] || {},
        invitations: inviteStats[0] || {},
        recentEventsLast30Days: recentEventCount[0]?.count || 0
      });
    } catch (err) {
      console.error("[CreatorHub] Analytics summary error:", err);
      return res.status(500).json({ error: "Failed to get analytics summary" });
    }
  });
  app2.get("/api/creatorhub/analytics/events", authenticateApiKey, async (req, res) => {
    try {
      const { eventType, from, to, limit } = req.query;
      const conditions = [eq2(creatorhubAnalyticsEvents.projectId, req.project.id)];
      if (eventType) conditions.push(eq2(creatorhubAnalyticsEvents.eventType, eventType));
      if (from) conditions.push(gte(creatorhubAnalyticsEvents.createdAt, new Date(from)));
      if (to) conditions.push(lte(creatorhubAnalyticsEvents.createdAt, new Date(to)));
      const events = await db.select().from(creatorhubAnalyticsEvents).where(and2(...conditions)).orderBy(desc(creatorhubAnalyticsEvents.createdAt)).limit(Math.min(parseInt(limit) || 100, 500));
      return res.json(events);
    } catch (err) {
      return res.status(500).json({ error: "Failed to list analytics events" });
    }
  });
  app2.post("/api/creatorhub/analytics/events", authenticateApiKey, async (req, res) => {
    try {
      const { eventType, eventData, creatorUserId, bookingId, source } = req.body;
      if (!eventType) return res.status(400).json({ error: "eventType is required" });
      const [event] = await db.insert(creatorhubAnalyticsEvents).values({
        projectId: req.project.id,
        creatorUserId: creatorUserId || null,
        bookingId: bookingId || null,
        eventType,
        eventData: typeof eventData === "string" ? eventData : JSON.stringify(eventData),
        source: source || "api",
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.header("User-Agent") || null
      }).returning();
      return res.status(201).json(event);
    } catch (err) {
      return res.status(500).json({ error: "Failed to track event" });
    }
  });
  app2.get("/api/creatorhub/audit-log", authenticateApiKey, async (req, res) => {
    try {
      const { limit, method, path: path2 } = req.query;
      const conditions = [eq2(creatorhubApiAuditLog.projectId, req.project.id)];
      if (method) conditions.push(eq2(creatorhubApiAuditLog.method, method));
      if (path2) conditions.push(sql3`${creatorhubApiAuditLog.path} LIKE ${"%" + path2 + "%"}`);
      const logs = await db.select().from(creatorhubApiAuditLog).where(and2(...conditions)).orderBy(desc(creatorhubApiAuditLog.createdAt)).limit(Math.min(parseInt(limit) || 50, 200));
      return res.json(logs);
    } catch (err) {
      return res.status(500).json({ error: "Failed to get audit log" });
    }
  });
  app2.post("/api/creatorhub/wedflow/impersonate/couple", authenticateApiKey, async (req, res) => {
    try {
      const { coupleId, email } = req.body;
      if (!coupleId && !email) {
        return res.status(400).json({ error: "coupleId or email required" });
      }
      let couple;
      if (coupleId) {
        [couple] = await db.select().from(coupleProfiles).where(eq2(coupleProfiles.id, coupleId));
      } else {
        [couple] = await db.select().from(coupleProfiles).where(eq2(coupleProfiles.email, email));
      }
      if (!couple) {
        return res.status(404).json({ error: "Couple not found" });
      }
      const sessionToken = crypto2.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await db.insert(coupleSessions).values({
        coupleId: couple.id,
        token: sessionToken,
        expiresAt
      });
      return res.json({
        sessionToken,
        expiresAt,
        couple: {
          id: couple.id,
          email: couple.email,
          displayName: couple.displayName,
          weddingDate: couple.weddingDate
        },
        usage: 'Use as "Authorization: Bearer <sessionToken>" on /api/couples/* endpoints'
      });
    } catch (err) {
      console.error("[CreatorHub] Impersonate couple error:", err);
      return res.status(500).json({ error: "Failed to impersonate couple" });
    }
  });
  app2.post("/api/creatorhub/wedflow/impersonate/vendor", authenticateApiKey, async (req, res) => {
    try {
      const { vendorId, email } = req.body;
      if (!vendorId && !email) {
        return res.status(400).json({ error: "vendorId or email required" });
      }
      let vendor;
      if (vendorId) {
        [vendor] = await db.select().from(vendors).where(eq2(vendors.id, vendorId));
      } else {
        [vendor] = await db.select().from(vendors).where(eq2(vendors.email, email));
      }
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      const sessionToken = crypto2.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await db.insert(vendorSessions).values({
        vendorId: vendor.id,
        token: sessionToken,
        expiresAt
      });
      return res.json({
        sessionToken,
        expiresAt,
        vendor: {
          id: vendor.id,
          email: vendor.email,
          businessName: vendor.businessName,
          status: vendor.status
        },
        usage: 'Use as "Authorization: Bearer <sessionToken>" on /api/vendors/* endpoints'
      });
    } catch (err) {
      console.error("[CreatorHub] Impersonate vendor error:", err);
      return res.status(500).json({ error: "Failed to impersonate vendor" });
    }
  });
  app2.get("/api/creatorhub/wedflow/couples", authenticateApiKey, async (req, res) => {
    try {
      const allCouples = await db.select({
        id: coupleProfiles.id,
        email: coupleProfiles.email,
        displayName: coupleProfiles.displayName,
        partnerEmail: coupleProfiles.partnerEmail,
        weddingDate: coupleProfiles.weddingDate,
        lastActiveAt: coupleProfiles.lastActiveAt,
        createdAt: coupleProfiles.createdAt
      }).from(coupleProfiles).orderBy(desc(coupleProfiles.createdAt));
      return res.json(allCouples);
    } catch (err) {
      console.error("[CreatorHub] List couples error:", err);
      return res.status(500).json({ error: "Failed to list couples" });
    }
  });
  app2.get("/api/creatorhub/wedflow/couples/:id", authenticateApiKey, async (req, res) => {
    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq2(coupleProfiles.id, req.params.id));
      if (!couple) return res.status(404).json({ error: "Couple not found" });
      const coupleConversations = await db.select().from(conversations).where(eq2(conversations.coupleId, couple.id)).orderBy(desc(conversations.lastMessageAt));
      return res.json({ ...couple, password: void 0, conversations: coupleConversations });
    } catch (err) {
      return res.status(500).json({ error: "Failed to get couple" });
    }
  });
  app2.patch("/api/creatorhub/wedflow/couples/:id", authenticateApiKey, async (req, res) => {
    try {
      const { displayName, weddingDate, partnerEmail } = req.body;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (displayName !== void 0) updates.displayName = displayName;
      if (weddingDate !== void 0) updates.weddingDate = weddingDate;
      if (partnerEmail !== void 0) updates.partnerEmail = partnerEmail;
      const [updated] = await db.update(coupleProfiles).set(updates).where(eq2(coupleProfiles.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ error: "Couple not found" });
      return res.json({ ...updated, password: void 0 });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update couple" });
    }
  });
  app2.get("/api/creatorhub/wedflow/vendors", authenticateApiKey, async (req, res) => {
    try {
      const status = req.query.status;
      const conditions = [];
      if (status) conditions.push(eq2(vendors.status, status));
      const allVendors = await db.select({
        id: vendors.id,
        email: vendors.email,
        businessName: vendors.businessName,
        categoryId: vendors.categoryId,
        description: vendors.description,
        status: vendors.status,
        city: vendors.city,
        phone: vendors.phone,
        website: vendors.website,
        createdAt: vendors.createdAt
      }).from(vendors).where(conditions.length ? and2(...conditions) : void 0).orderBy(desc(vendors.createdAt));
      return res.json(allVendors);
    } catch (err) {
      console.error("[CreatorHub] List vendors error:", err);
      return res.status(500).json({ error: "Failed to list vendors" });
    }
  });
  app2.get("/api/creatorhub/wedflow/vendors/:id", authenticateApiKey, async (req, res) => {
    try {
      const [vendor] = await db.select().from(vendors).where(eq2(vendors.id, req.params.id));
      if (!vendor) return res.status(404).json({ error: "Vendor not found" });
      const products = await db.select().from(vendorProducts).where(eq2(vendorProducts.vendorId, vendor.id));
      const offers = await db.select().from(vendorOffers).where(eq2(vendorOffers.vendorId, vendor.id)).orderBy(desc(vendorOffers.createdAt));
      const vendorConversations = await db.select().from(conversations).where(eq2(conversations.vendorId, vendor.id)).orderBy(desc(conversations.lastMessageAt));
      return res.json({
        ...vendor,
        password: void 0,
        products,
        offers,
        conversations: vendorConversations
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to get vendor" });
    }
  });
  app2.patch("/api/creatorhub/wedflow/vendors/:id", authenticateApiKey, async (req, res) => {
    try {
      const { businessName, description, city, phone, website, status } = req.body;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (businessName !== void 0) updates.businessName = businessName;
      if (description !== void 0) updates.description = description;
      if (city !== void 0) updates.city = city;
      if (phone !== void 0) updates.phone = phone;
      if (website !== void 0) updates.website = website;
      if (status !== void 0) updates.status = status;
      const [updated] = await db.update(vendors).set(updates).where(eq2(vendors.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ error: "Vendor not found" });
      return res.json({ ...updated, password: void 0 });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update vendor" });
    }
  });
  app2.post("/api/creatorhub/wedflow/vendors/:id/approve", authenticateApiKey, async (req, res) => {
    try {
      const [updated] = await db.update(vendors).set({ status: "active", updatedAt: /* @__PURE__ */ new Date() }).where(eq2(vendors.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ error: "Vendor not found" });
      return res.json({ ...updated, password: void 0 });
    } catch (err) {
      return res.status(500).json({ error: "Failed to approve vendor" });
    }
  });
  app2.post("/api/creatorhub/wedflow/vendors/:id/reject", authenticateApiKey, async (req, res) => {
    try {
      const [updated] = await db.update(vendors).set({ status: "rejected", updatedAt: /* @__PURE__ */ new Date() }).where(eq2(vendors.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ error: "Vendor not found" });
      return res.json({ ...updated, password: void 0 });
    } catch (err) {
      return res.status(500).json({ error: "Failed to reject vendor" });
    }
  });
  app2.get("/api/creatorhub/wedflow/all-conversations", authenticateApiKey, async (req, res) => {
    try {
      const allConvos = await db.select().from(conversations).orderBy(desc(conversations.lastMessageAt)).limit(parseInt(req.query.limit) || 50);
      return res.json(allConvos);
    } catch (err) {
      return res.status(500).json({ error: "Failed to list conversations" });
    }
  });
  app2.post("/api/creatorhub/wedflow/messages", authenticateApiKey, async (req, res) => {
    try {
      const { conversationId, content, senderType, senderId, attachmentUrl, attachmentType } = req.body;
      if (!conversationId || !content || !senderType || !senderId) {
        return res.status(400).json({ error: "conversationId, content, senderType, senderId required" });
      }
      const [conversation] = await db.select().from(conversations).where(eq2(conversations.id, conversationId));
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const [message] = await db.insert(messages).values({
        conversationId,
        content,
        senderType,
        // "couple" or "vendor"
        senderId,
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null
      }).returning();
      await db.update(conversations).set({
        lastMessageAt: /* @__PURE__ */ new Date(),
        lastMessage: content.substring(0, 200)
      }).where(eq2(conversations.id, conversationId));
      return res.status(201).json(message);
    } catch (err) {
      console.error("[CreatorHub] Send message error:", err);
      return res.status(500).json({ error: "Failed to send message" });
    }
  });
  app2.get("/api/creatorhub/wedflow/statistics", authenticateApiKey, async (req, res) => {
    try {
      const [coupleCount] = await db.select({ count: sql3`count(*)` }).from(coupleProfiles);
      const [vendorCount] = await db.select({ count: sql3`count(*)` }).from(vendors);
      const [activeVendors] = await db.select({ count: sql3`count(*)` }).from(vendors).where(eq2(vendors.status, "active"));
      const [pendingVendors] = await db.select({ count: sql3`count(*)` }).from(vendors).where(eq2(vendors.status, "pending"));
      const [convoCount] = await db.select({ count: sql3`count(*)` }).from(conversations);
      const [msgCount] = await db.select({ count: sql3`count(*)` }).from(messages);
      return res.json({
        couples: Number(coupleCount.count),
        vendors: {
          total: Number(vendorCount.count),
          active: Number(activeVendors.count),
          pending: Number(pendingVendors.count)
        },
        conversations: Number(convoCount.count),
        messages: Number(msgCount.count)
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to get statistics" });
    }
  });
  app2.use("/api/projects", (req, res, next) => {
    req.url = req.url;
    res.redirect(307, `/api/creatorhub/projects${req.url === "/" ? "" : req.url}`);
  });
  app2.use("/api/users", (req, res, next) => {
    res.redirect(307, `/api/creatorhub/users${req.url === "/" ? "" : req.url}`);
  });
  app2.use("/api/bookings", (req, res, next) => {
    res.redirect(307, `/api/creatorhub/bookings${req.url === "/" ? "" : req.url}`);
  });
  app2.use("/api/invitations", (req, res, next) => {
    res.redirect(307, `/api/creatorhub/invitations${req.url === "/" ? "" : req.url}`);
  });
  console.log("[CreatorHub] API routes registered at /api/creatorhub/* (also /api/projects, /api/users, /api/bookings, /api/invitations)");
}

// server/timeline-templates.ts
var TIMELINE_TEMPLATES = {
  // === NORSK (was: norway) ===
  norsk: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudens og brudgommens forberedelser" },
    { time: "14:00", title: "Vielse", icon: "users", description: "Kirkelig vielse" },
    { time: "14:30", title: "Gratulering", icon: "heart", description: "Gratulasjon utenfor kirken" },
    { time: "15:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "16:00", title: "Cocktail", icon: "coffee", description: "Mingling og forfriskninger" },
    { time: "17:00", title: "Middag", icon: "coffee", description: "Bryllupsmiddag" },
    { time: "19:00", title: "Taler", icon: "users", description: "Taler og sk\xE5ler" },
    { time: "20:00", title: "Kransekake", icon: "heart", description: "Kransekake-seremoni" },
    { time: "20:30", title: "Brudevalsen", icon: "music", description: "F\xF8rste dans" },
    { time: "21:00", title: "Dans og fest", icon: "music", description: "Feiring til sent p\xE5 kvelden" }
  ],
  // === SIKH (stays same) ===
  sikh: [
    { time: "06:00", title: "Ganesh Puja", icon: "star", description: "B\xF8nn for \xE5 fjerne hindringer" },
    { time: "07:00", title: "Madhuparka", icon: "coffee", description: "Brudgommens velkomst" },
    { time: "08:00", title: "Kanyadaan", icon: "users", description: "Farens gave av bruden" },
    { time: "09:00", title: "Agni Poojan", icon: "sun", description: "Hellig ildseremoni" },
    { time: "10:00", title: "Saptapadi", icon: "heart", description: "De syv skritt rundt ilden" },
    { time: "11:00", title: "Mangalsutra", icon: "heart", description: "Hellig halskjede" },
    { time: "12:00", title: "Sindoor", icon: "star", description: "R\xF8d farge i h\xE5rskillen" },
    { time: "13:00", title: "Lunch & Velsignelser", icon: "coffee", description: "M\xE5ltid og velsignelser fra eldre" },
    { time: "14:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "16:00", title: "Reception", icon: "users", description: "Reception for gjester" },
    { time: "18:00", title: "Middag", icon: "coffee", description: "Festmiddag" }
  ],
  // === INDISK (was: hindu) ===
  indisk: [
    { time: "06:00", title: "Ganesh Puja", icon: "star", description: "B\xF8nn for \xE5 fjerne hindringer" },
    { time: "07:00", title: "Madhuparka", icon: "coffee", description: "Brudgommens velkomst" },
    { time: "08:00", title: "Kanyadaan", icon: "users", description: "Farens gave av bruden" },
    { time: "09:00", title: "Agni Poojan", icon: "sun", description: "Hellig ildseremoni" },
    { time: "10:00", title: "Saptapadi", icon: "heart", description: "De syv skritt rundt ilden" },
    { time: "11:00", title: "Mangalsutra", icon: "heart", description: "Hellig halskjede" },
    { time: "12:00", title: "Sindoor", icon: "star", description: "R\xF8d farge i h\xE5rskillen" },
    { time: "13:00", title: "Lunch & Velsignelser", icon: "coffee", description: "M\xE5ltid og velsignelser fra eldre" },
    { time: "14:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "16:00", title: "Reception", icon: "users", description: "Reception for gjester" },
    { time: "18:00", title: "Middag", icon: "coffee", description: "Festmiddag" },
    { time: "20:00", title: "Vidai", icon: "moon", description: "Brudens avskjed fra hjemmet" }
  ],
  sikh: [
    { time: "07:00", title: "Anand Karaj forberedelse", icon: "sun", description: "Morgenforberedelser" },
    { time: "09:00", title: "Milni", icon: "users", description: "Familienes m\xF8te" },
    { time: "10:00", title: "Anand Karaj", icon: "heart", description: "Vielse i Gurdwara" },
    { time: "11:00", title: "Laavan - F\xF8rste runde", icon: "star", description: "F\xF8rste runde rundt Guru Granth Sahib" },
    { time: "11:15", title: "Laavan - Andre runde", icon: "star", description: "Andre runde - disiplin" },
    { time: "11:30", title: "Laavan - Tredje runde", icon: "star", description: "Tredje runde - spiritualitet" },
    { time: "11:45", title: "Laavan - Fjerde runde", icon: "star", description: "Fjerde runde - harmoni" },
    { time: "12:00", title: "Palla-seremoni", icon: "heart", description: "Sjal som binder paret" },
    { time: "12:30", title: "Karah Parshad", icon: "coffee", description: "Hellig s\xF8t pudding" },
    { time: "13:00", title: "Langar", icon: "coffee", description: "Fellesskap m\xE5ltid i Gurdwara" },
    { time: "15:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "18:00", title: "Reception", icon: "users", description: "Kveldsmottak for gjester" },
    { time: "20:00", title: "Doli", icon: "moon", description: "Brudens avreise" }
  ],
  // === PAKISTANSK (new) ===
  pakistansk: [
    { time: "16:00", title: "Mehndi forberedelse", icon: "heart", description: "Forberedelser til Mehndi-kveld" },
    { time: "17:00", title: "Mehndi-seremoni", icon: "star", description: "Henna-p\xE5f\xF8ring med tradisjonelle sanger" },
    { time: "18:00", title: "Sangeet", icon: "music", description: "Musikk, dans og opptredener" },
    { time: "20:00", title: "Mehndi-fest", icon: "coffee", description: "Mat og feiring" },
    { time: "09:00", title: "Baraat forberedelse", icon: "sun", description: "Brudgommens forberedelser" },
    { time: "11:00", title: "Baraat", icon: "users", description: "Brudgommens storsl\xE5tte prosesjon" },
    { time: "12:00", title: "Nikkah", icon: "heart", description: "Islamsk vielsesseremoni med kontrakt" },
    { time: "13:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "14:00", title: "Rukhsati", icon: "moon", description: "Brudens avskjed fra hjemmet" },
    { time: "18:00", title: "Walima", icon: "coffee", description: "Brudgommens familieresepsjon" },
    { time: "20:00", title: "Walima middag", icon: "coffee", description: "Storsl\xE5tt festmiddag" }
  ],
  // === TYRKISK (new) ===
  tyrkisk: [
    { time: "18:00", title: "K\u0131na Gecesi forberedelse", icon: "heart", description: "Forberedelse til henna-kveld" },
    { time: "19:00", title: "K\u0131na Gecesi", icon: "star", description: "Tradisjonell henna-kveld med sanger" },
    { time: "20:00", title: "Henna-p\xE5f\xF8ring", icon: "heart", description: "Bruden f\xE5r henna med gullmynt i h\xE5ndflaten" },
    { time: "21:00", title: "Dans og feiring", icon: "music", description: "Tradisjonell tyrkisk dans og feiring" },
    { time: "10:00", title: "Gelin Alma", icon: "users", description: "Brudgommen henter bruden" },
    { time: "12:00", title: "D\xFC\u011F\xFCn seremoni", icon: "heart", description: "Bryllupsseremoni" },
    { time: "13:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "14:00", title: "Tak\u0131 T\xF6reni", icon: "star", description: "Gullsmykke-seremoni" },
    { time: "15:00", title: "D\xFC\u011F\xFCn fest", icon: "coffee", description: "Storsl\xE5tt bryllupsmiddag" },
    { time: "17:00", title: "Halay dans", icon: "music", description: "Tradisjonell gruppedan i ring" }
  ],
  // === ARABISK (new) ===
  arabisk: [
    { time: "18:00", title: "Henna-kveld", icon: "star", description: "Tradisjonell henna-feiring for kvinner" },
    { time: "19:00", title: "Henna-p\xE5f\xF8ring", icon: "heart", description: "Kunstferdie henna-m\xF8nstre" },
    { time: "20:00", title: "Henna-fest", icon: "music", description: "Tradisjonell musikk og dans" },
    { time: "14:00", title: "Nikah forberedelse", icon: "sun", description: "Forberedelser til vielsen" },
    { time: "15:00", title: "Nikah", icon: "heart", description: "Islamsk vielse med kontrakt" },
    { time: "16:00", title: "Zaffe innmarsj", icon: "music", description: "Spektakul\xE6r prosesjon med trommer" },
    { time: "17:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "18:00", title: "Walima middag", icon: "coffee", description: "Storsl\xE5tt bryllupsmiddag" },
    { time: "20:00", title: "Dabke-dans", icon: "music", description: "Tradisjonell gruppedans" },
    { time: "22:00", title: "Avslutning", icon: "moon", description: "Avskjed og velsignelser" }
  ],
  // === SOMALISK (new) ===
  somalisk: [
    { time: "14:00", title: "Nikah forberedelse", icon: "sun", description: "Forberedelser til vielsen" },
    { time: "15:00", title: "Nikah seremoni", icon: "heart", description: "Islamsk vielse med Koran-resitasjon" },
    { time: "16:00", title: "Duaa og velsignelse", icon: "star", description: "B\xF8nner for brudeparet" },
    { time: "17:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "18:00", title: "Aroos feiring", icon: "music", description: "Tradisjonell somalisk feiring" },
    { time: "19:00", title: "Aroos middag", icon: "coffee", description: "Autentisk somalisk mat" },
    { time: "20:00", title: "Niiko dans", icon: "music", description: "Tradisjonell somalisk dans" },
    { time: "22:00", title: "Shaash Saar", icon: "heart", description: "Sl\xF8r-seremoni" }
  ],
  // === ETIOPISK (new) ===
  etiopisk: [
    { time: "10:00", title: "Telosh forberedelse", icon: "sun", description: "Morgenforberedelser" },
    { time: "12:00", title: "Telosh seremoni", icon: "heart", description: "Tradisjonell f\xF8rbryllups-seremoni" },
    { time: "13:00", title: "Velsignelse fra eldre", icon: "users", description: "Eldre gir r\xE5d og velsignelser" },
    { time: "14:00", title: "Vielsesseremoni", icon: "heart", description: "Ortodoks eller sivil vielse" },
    { time: "15:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "16:00", title: "Kaffe-seremoni", icon: "coffee", description: "Tradisjonell etiopisk kaffe-seremoni" },
    { time: "17:00", title: "Melse resepsjon", icon: "coffee", description: "Injera og tradisjonell mat" },
    { time: "19:00", title: "Eskista dans", icon: "music", description: "Tradisjonell etiopisk dans" },
    { time: "21:00", title: "Avslutning", icon: "moon", description: "Velsignelser og avskjed" }
  ],
  // === NIGERIANSK (new) ===
  nigeriansk: [
    { time: "10:00", title: "White Wedding forberedelser", icon: "heart", description: "Forberedelser til kirkelig vielse" },
    { time: "12:00", title: "White Wedding", icon: "users", description: "Kirkelig vielsesseremoni" },
    { time: "13:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "14:00", title: "Cocktail", icon: "coffee", description: "Mingling etter kirken" },
    { time: "16:00", title: "Traditional Wedding", icon: "star", description: "Tradisjonell kulturell seremoni" },
    { time: "17:00", title: "Palmvin-test", icon: "coffee", description: "Bruden finner brudgommen med palmvin" },
    { time: "18:00", title: "Tradisjonell middag", icon: "coffee", description: "Jollof ris og tradisjonell mat" },
    { time: "20:00", title: "Aso-Oke dans", icon: "music", description: "Dans i matchende tradisjonelle kl\xE6r" },
    { time: "22:00", title: "Spraying", icon: "star", description: "Gjester kaster pengesedler p\xE5 dansegulvet" }
  ],
  // === MUSLIMSK (was: muslim) ===
  muslimsk: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudens og brudgommens forberedelser" },
    { time: "14:00", title: "Mehndi (valgfritt)", icon: "star", description: "Henna-seremoni for bruden" },
    { time: "16:00", title: "Nikah forberedelse", icon: "users", description: "Forberedelse til vielse" },
    { time: "17:00", title: "Nikah", icon: "heart", description: "Islamsk vielse med imam og vitner" },
    { time: "17:30", title: "Mehr-gave", icon: "star", description: "Brudgommens gave til bruden" },
    { time: "18:00", title: "Du'a", icon: "sun", description: "B\xF8nner og velsignelser" },
    { time: "18:30", title: "Gratulering", icon: "users", description: "Gratulasjon fra familie og venner" },
    { time: "19:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "20:00", title: "Walima", icon: "coffee", description: "Bryllupsfest arrangert av brudgommen" },
    { time: "21:00", title: "Middag", icon: "coffee", description: "Festm\xE5ltid for alle gjester" },
    { time: "23:00", title: "Rukhsati", icon: "moon", description: "Brudens avskjed fra familien" }
  ],
  // === LIBANESISK (new) ===
  libanesisk: [
    { time: "18:00", title: "Henna Party", icon: "star", description: "Tradisjonell henna-feiring" },
    { time: "19:00", title: "Henna-p\xE5f\xF8ring", icon: "heart", description: "Eldre kvinner p\xE5f\xF8rer henna" },
    { time: "20:00", title: "Libanesisk fest", icon: "music", description: "Tradisjonell musikk og dabke" },
    { time: "12:00", title: "Vielsesseremoni", icon: "heart", description: "Kirkelig eller sivil vielse" },
    { time: "13:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "15:00", title: "Zaffe innmarsj", icon: "music", description: "Spektakul\xE6r prosesjon med trommer" },
    { time: "16:00", title: "Meze-bord", icon: "coffee", description: "Tradisjonell libanesisk mat" },
    { time: "18:00", title: "Middag", icon: "coffee", description: "Storsl\xE5tt libanesisk festmiddag" },
    { time: "20:00", title: "Dabke-dans", icon: "music", description: "Tradisjonell libanesisk gruppedans" },
    { time: "22:00", title: "Avslutning", icon: "moon", description: "Velsignelser og avskjed" }
  ],
  // === FILIPINO (new) ===
  filipino: [
    { time: "18:00", title: "Despedida de Soltera", icon: "star", description: "Avskjedsfest for singel-livet" },
    { time: "19:00", title: "Despedida feiring", icon: "music", description: "Leker, mat og gaver" },
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudens og brudgommens forberedelser" },
    { time: "12:00", title: "Katolsk vielse", icon: "users", description: "Vielse med tradisjonelle elementer" },
    { time: "12:30", title: "Arras mynter", icon: "star", description: "13 mynter som symbol p\xE5 fors\xF8rgelse" },
    { time: "12:45", title: "Veil & Cord", icon: "heart", description: "Sl\xF8r og ledning som symbol p\xE5 enhet" },
    { time: "13:00", title: "Unity Candle", icon: "sun", description: "Enhetslys-seremoni" },
    { time: "14:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "16:00", title: "Reception", icon: "coffee", description: "Resepsjon med tradisjonell mat" },
    { time: "18:00", title: "Money Dance", icon: "music", description: "Gjester fester penger p\xE5 brudeparet" }
  ],
  // === KINESISK (was: chinese) ===
  kinesisk: [
    { time: "07:00", title: "H\xE5rpynt-seremoni", icon: "heart", description: "Brudens h\xE5r og sminke" },
    { time: "08:00", title: "Brudgommen henter bruden", icon: "users", description: "D\xF8r-spill og hindringer" },
    { time: "09:00", title: "Te-seremoni", icon: "coffee", description: "Servering av te til eldre familiemedlemmer" },
    { time: "10:00", title: "H\xE5rb\xF8ying", icon: "star", description: "Bruden b\xF8yer seg for forfedre" },
    { time: "11:00", title: "R\xF8de konvolutter", icon: "heart", description: "Hongbao fra eldre" },
    { time: "12:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "14:00", title: "Ankomst til bankett", icon: "users", description: "Gjestenes ankomst" },
    { time: "15:00", title: "Bryllups-bankett", icon: "coffee", description: "Tradisjonelt 8-retters m\xE5ltid" },
    { time: "16:00", title: "Kjole-skift", icon: "heart", description: "Bruden bytter til Qipao/Cheongsam" },
    { time: "17:00", title: "Sk\xE5ler rundt bordene", icon: "users", description: "Brudeparet sk\xE5ler med gjestene" },
    { time: "18:00", title: "Lykke-spill", icon: "star", description: "Tradisjonelle bryllupsleker" },
    { time: "19:00", title: "Avskjed", icon: "moon", description: "Takk til gjestene" }
  ],
  // === KOREANSK (new) ===
  koreansk: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudeparet gj\xF8res klare" },
    { time: "12:00", title: "Moderne vielse", icon: "users", description: "Vielse i Wedding Hall" },
    { time: "12:30", title: "Pyebaek-forberedelse", icon: "star", description: "Skifte til Hanbok" },
    { time: "13:00", title: "Pyebaek", icon: "heart", description: "Tradisjonell familieseremoni" },
    { time: "13:30", title: "Jujube-kasting", icon: "star", description: "Fruktbarhetsritual" },
    { time: "14:00", title: "Fotosession", icon: "camera", description: "Bilder i Hanbok" },
    { time: "15:00", title: "Koreansk buffet", icon: "coffee", description: "Tradisjonelt koreansk festm\xE5ltid" },
    { time: "17:00", title: "Avslutning", icon: "moon", description: "Takk til gjestene" }
  ],
  // === THAI (new) ===
  thai: [
    { time: "06:00", title: "Tak Bat", icon: "sun", description: "Almisse-runde med munker" },
    { time: "08:00", title: "Khan Maak prosesjon", icon: "music", description: "Brudgommens storsl\xE5tte prosesjon" },
    { time: "09:00", title: "Gate-penger", icon: "star", description: "Brudgommen betaler for \xE5 passere" },
    { time: "09:30", title: "Sinsod-seremoni", icon: "heart", description: "Brudepris-seremoni" },
    { time: "10:00", title: "Sai Sin", icon: "heart", description: "Hellig tr\xE5d bindes rundt hendene" },
    { time: "10:30", title: "Rod Nam Sang", icon: "coffee", description: "Vann-velsignelse fra eldre" },
    { time: "11:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "12:00", title: "Bryllupsmiddag", icon: "coffee", description: "Tradisjonelt thai festm\xE5ltid" },
    { time: "14:00", title: "Tradisjonell dans", icon: "music", description: "Thai kulturell dans" }
  ],
  // === IRANSK (new) ===
  iransk: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Bruden og brudgommens forberedelser" },
    { time: "14:00", title: "Sofreh-e Aghd oppdekning", icon: "star", description: "Det hellige bordet dekkes" },
    { time: "15:00", title: "Gjestenes ankomst", icon: "users", description: "Gjester samles rundt Sofreh" },
    { time: "15:30", title: "Aghd seremoni", icon: "heart", description: "Vielsesseremoni med tre samtykker" },
    { time: "16:00", title: "Sukker-maling", icon: "star", description: "Sukker males over silkeklede" },
    { time: "16:30", title: "Honning-ritual", icon: "coffee", description: "Brudeparet mater hverandre honning" },
    { time: "17:00", title: "Fotosession", icon: "camera", description: "Bilder ved Sofreh-e Aghd" },
    { time: "18:00", title: "Aroosi resepsjon", icon: "coffee", description: "Storsl\xE5tt persisk festmiddag" },
    { time: "20:00", title: "Knife Dance", icon: "music", description: "Morsom kake-dans tradisjon" },
    { time: "22:00", title: "Persisk dans", icon: "music", description: "Feiring til sent p\xE5 kvelden" }
  ],
  // === ANNET (new) ===
  annet: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudeparets forberedelser" },
    { time: "13:00", title: "Seremoni", icon: "heart", description: "Tilpasset vielsesseremoni" },
    { time: "14:00", title: "Gratulasjon", icon: "users", description: "Gratulasjon fra gjester" },
    { time: "15:00", title: "Fotosession", icon: "camera", description: "Bilder av brudeparet" },
    { time: "16:00", title: "Resepsjon", icon: "coffee", description: "Cocktail og mingling" },
    { time: "17:00", title: "Middag", icon: "coffee", description: "Festmiddag" },
    { time: "19:00", title: "Taler", icon: "users", description: "Taler og sk\xE5ler" },
    { time: "20:00", title: "F\xF8rste dans", icon: "music", description: "Brudeparets f\xF8rste dans" },
    { time: "21:00", title: "Fest", icon: "music", description: "Fest og dans" }
  ]
};
var DEFAULT_TIMELINE = [
  { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudens og brudgommens forberedelser" },
  { time: "14:00", title: "Vielse", icon: "users", description: "Vielsesseremoni" },
  { time: "14:30", title: "Gratulering", icon: "heart", description: "Gratulasjon" },
  { time: "15:00", title: "Fotosession", icon: "camera", description: "Bilder av brudeparet" },
  { time: "16:00", title: "Cocktail", icon: "coffee", description: "Mingling" },
  { time: "17:00", title: "Middag", icon: "coffee", description: "Bryllupsmiddag" },
  { time: "19:00", title: "Taler", icon: "users", description: "Taler og sk\xE5ler" },
  { time: "20:00", title: "Bryllupskake", icon: "heart", description: "Kake-seremoni" },
  { time: "20:30", title: "F\xF8rste dans", icon: "music", description: "Brudeparets f\xF8rste dans" },
  { time: "21:00", title: "Dans og fest", icon: "music", description: "Fest" }
];
var LEGACY_KEY_MAP = {
  norway: "norsk",
  hindu: "indisk",
  muslim: "muslimsk",
  jewish: "j\xF8disk",
  chinese: "kinesisk",
  sweden: "norsk",
  // fallback to closest
  denmark: "norsk"
  // fallback to closest
};
function resolveTraditionKey(key) {
  return LEGACY_KEY_MAP[key] || key;
}

// server/routes.ts
init_schema();
import { eq as eq3, and as and3, desc as desc2, sql as sql4, inArray as inArray2, or as or2, gte as gte2, lte as lte2, isNotNull } from "drizzle-orm";
function generateAccessCode() {
  return crypto3.randomBytes(8).toString("hex").toUpperCase();
}
function generateSessionToken() {
  return crypto3.randomBytes(32).toString("hex");
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
  { name: "Videograf", icon: "film", description: "Bryllupsvideofilmer" },
  { name: "Blomster", icon: "flower", description: "Blomsterdekorat\xF8rer" },
  { name: "Catering", icon: "coffee", description: "Mat og drikke" },
  { name: "Musikk", icon: "music", description: "Band, DJ og musikere" },
  { name: "Venue", icon: "venue", description: "Bryllupslokaler" },
  { name: "Kake", icon: "cake", description: "Bryllupskaker" },
  { name: "Planlegger", icon: "clipboard", description: "Bryllupsplanleggere" },
  { name: "H\xE5r & Makeup", icon: "scissors", description: "Styling og sminke" },
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
  { name: "Husdyr", icon: "heart", description: "Kj\xE6ledyr p\xE5 bryllupet" }
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
    const [vendorSession] = await db.select({ vendorId: vendorSessions.vendorId }).from(vendorSessions).where(and3(eq3(vendorSessions.token, token), sql4`${vendorSessions.expiresAt} > NOW()`));
    if (!vendorSession) return null;
    const [vendor] = await db.select().from(vendors).where(eq3(vendors.id, vendorSession.vendorId));
    if (!vendor || vendor.status !== "approved") return null;
    return vendorSession.vendorId;
  }
  async function getOrCreateAdminConversationId(vendorId) {
    const existing = await db.select().from(adminConversations).where(eq3(adminConversations.vendorId, vendorId));
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
    const [sess] = await db.select({ coupleId: coupleSessions.coupleId }).from(coupleSessions).where(and3(eq3(coupleSessions.token, token), sql4`${coupleSessions.expiresAt} > NOW()`));
    if (!sess) return null;
    const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, sess.coupleId));
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
  app2.get("/api/diagnostics", (req, res) => {
    const diagnostics = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        HAS_DATABASE_URL: !!process.env.DATABASE_URL,
        HAS_ADMIN_SECRET: !!process.env.ADMIN_SECRET,
        ADMIN_SECRET_VALUE: process.env.ADMIN_SECRET || "NOT SET"
      },
      node_version: process.version,
      build_version: "ch-full-access"
    };
    res.json(diagnostics);
  });
  app2.get("/api/test-query/:id", async (req, res) => {
    const { id } = req.params;
    try {
      console.log("[TestQuery] Testing query with ID:", id);
      const result = await db.select({
        id: coupleProfiles.id,
        email: coupleProfiles.email,
        displayName: coupleProfiles.displayName
      }).from(coupleProfiles).where(eq3(coupleProfiles.id, id));
      console.log("[TestQuery] Success, found:", result.length);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("[TestQuery] Error:", error);
      res.status(500).json({ error: "Query failed", details: error instanceof Error ? error.message : String(error) });
    }
  });
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
  app2.get("/api/subscription/tiers", async (_req, res) => {
    try {
      const { subscriptionTiers: subscriptionTiers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const tiers = await db.select().from(subscriptionTiers2).where(eq3(subscriptionTiers2.isActive, true)).orderBy(subscriptionTiers2.sortOrder);
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching subscription tiers:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnement" });
    }
  });
  app2.post("/api/admin/subscriptions/check-expired-trials", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { vendorSubscriptions: vendorSubscriptions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const now = /* @__PURE__ */ new Date();
      const expiredTrials = await db.select().from(vendorSubscriptions2).where(
        and3(
          eq3(vendorSubscriptions2.status, "trialing"),
          sql4`${vendorSubscriptions2.currentPeriodEnd} < ${now}`
        )
      );
      if (expiredTrials.length > 0) {
        await db.update(vendorSubscriptions2).set({
          status: "paused",
          pausedUntil: sql4`${vendorSubscriptions2.currentPeriodEnd} + interval '365 days'`,
          // Pause for 1 year
          updatedAt: now
        }).where(
          and3(
            eq3(vendorSubscriptions2.status, "trialing"),
            sql4`${vendorSubscriptions2.currentPeriodEnd} < ${now}`
          )
        );
        for (const sub of expiredTrials) {
          const [vendor] = await db.select().from(vendors).where(eq3(vendors.id, sub.vendorId));
          if (!vendor) continue;
          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: sub.vendorId,
            type: "payment_required",
            title: "Betaling p\xE5krevd",
            body: "Din 30-dagers pr\xF8veperiode har utl\xF8pt. Betal for \xE5 fortsette \xE5 bruke Wedflow og motta henvendelser fra brudepar.",
            sentVia: "in_app"
          });
          console.log(`Trial expired for vendor ${vendor.email} - notification created`);
        }
      }
      res.json({
        message: "Sjekket utl\xF8pte pr\xF8veperioder",
        expiredCount: expiredTrials.length
      });
    } catch (error) {
      console.error("Error checking expired trials:", error);
      res.status(500).json({ error: "Kunne ikke sjekke utl\xF8pte pr\xF8veperioder" });
    }
  });
  app2.post("/api/admin/subscriptions/send-trial-reminders", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { vendorSubscriptions: vendorSubscriptions2, subscriptionTiers: subscriptionTiers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const now = /* @__PURE__ */ new Date();
      const reminderDays = [7, 3, 1];
      let sentCount = 0;
      for (const days of reminderDays) {
        const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1e3);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        const expiringTrials = await db.select({
          subscription: vendorSubscriptions2,
          tier: subscriptionTiers2,
          vendor: vendors
        }).from(vendorSubscriptions2).innerJoin(subscriptionTiers2, eq3(vendorSubscriptions2.tierId, subscriptionTiers2.id)).innerJoin(vendors, eq3(vendorSubscriptions2.vendorId, vendors.id)).where(
          and3(
            eq3(vendorSubscriptions2.status, "trialing"),
            sql4`${vendorSubscriptions2.currentPeriodEnd}::date = ${startOfDay}::date`
          )
        );
        for (const { subscription, tier, vendor } of expiringTrials) {
          let title = "";
          let body = "";
          if (days === 7) {
            title = "7 dager til pr\xF8veperioden utl\xF8per";
            body = `Ikke g\xE5 glipp av henvendelser! Showcase-galleriet, meldinger og nye leads deaktiveres om en uke.

Sikre din plass for kun ${tier.priceNok} NOK/mnd.`;
          } else if (days === 3) {
            title = "Siste sjanse - 3 dager igjen!";
            body = `Om 3 dager mister du tilgang til alle funksjoner:
\u2022 Showcase-galleriet
\u2022 Aktive samtaler
\u2022 Nye henvendelser
\u2022 Statistikk

Betal n\xE5: ${tier.priceNok} NOK/mnd`;
          } else if (days === 1) {
            title = "SISTE DAG - Pr\xF8veperioden utl\xF8per i morgen!";
            body = `I morgen g\xE5r du glipp av potensielle kunder!

Sikre tilgang n\xE5 for ${tier.priceNok} NOK/mnd og fortsett \xE5 motta henvendelser.`;
          }
          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: vendor.id,
            type: "trial_reminder",
            title,
            body,
            sentVia: "in_app"
          });
          console.log(`Sent ${days}-day reminder to ${vendor.email}`);
          sentCount++;
        }
      }
      res.json({
        message: "Sendte pr\xF8veperiode-p\xE5minnelser",
        sentCount
      });
    } catch (error) {
      console.error("Error sending trial reminders:", error);
      res.status(500).json({ error: "Kunne ikke sende p\xE5minnelser" });
    }
  });
  app2.post("/api/vendors/register", async (req, res) => {
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
      const existingVendor = await db.select().from(vendors).where(eq3(vendors.email, email));
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
      if (tierId) {
        const now = /* @__PURE__ */ new Date();
        const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1e3);
        await db.insert(vendorSubscriptions).values({
          vendorId: newVendor.id,
          tierId,
          status: "trialing",
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          autoRenew: true
        }).onConflictDoNothing();
      }
      const { password: _, ...vendorWithoutPassword } = newVendor;
      res.status(201).json({
        message: "Registrering vellykket! Din s\xF8knad er under behandling. Du f\xE5r 30 dager gratis pr\xF8veperiode.",
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
      const [vendor] = await db.select().from(vendors).where(eq3(vendors.email, email));
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
      let vendorCategory = null;
      if (vendor.categoryId) {
        const [category] = await db.select().from(vendorCategories).where(eq3(vendorCategories.id, vendor.categoryId));
        vendorCategory = category?.name || null;
      }
      const { password: _, ...vendorWithoutPassword } = vendor;
      res.json({ vendor: vendorWithoutPassword, sessionToken, vendorCategory });
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
      const [existingVendor] = await db.select().from(vendors).where(eq3(vendors.email, googleEmail));
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
      await db.delete(vendorSessions).where(eq3(vendorSessions.token, token));
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
      const [vendorSession] = await db.select({ vendorId: vendorSessions.vendorId }).from(vendorSessions).where(and3(
        eq3(vendorSessions.token, token),
        sql4`${vendorSessions.expiresAt} > NOW()`
      ));
      if (!vendorSession) {
        res.status(401).json({ valid: false, error: "\xD8kt utl\xF8pt" });
        return;
      }
      const [vendor] = await db.select().from(vendors).where(eq3(vendors.id, vendorSession.vendorId));
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
        hasReviewBadge: subscriptionTiers.hasReviewBadge
      }).from(vendors).leftJoin(vendorCategories, eq3(vendorCategories.id, vendors.categoryId)).leftJoin(
        vendorSubscriptions,
        and3(
          eq3(vendorSubscriptions.vendorId, vendors.id),
          eq3(vendorSubscriptions.status, "active")
        )
      ).leftJoin(subscriptionTiers, eq3(subscriptionTiers.id, vendorSubscriptions.tierId)).where(eq3(vendors.status, "approved"));
      let filtered = categoryId ? vendorsWithSubs.filter((v) => v.categoryId === categoryId) : vendorsWithSubs;
      filtered.sort((a, b) => {
        if (a.canHighlightProfile && !b.canHighlightProfile) return -1;
        if (!a.canHighlightProfile && b.canHighlightProfile) return 1;
        if (a.hasPrioritizedSearch && !b.hasPrioritizedSearch) return -1;
        if (!a.hasPrioritizedSearch && b.hasPrioritizedSearch) return 1;
        return (a.businessName || "").localeCompare(b.businessName || "");
      });
      const response = filtered.map((v) => ({
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
        hasReviewBadge: v.hasReviewBadge || false
      }));
      res.json(response);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente leverand\xF8rer" });
    }
  });
  app2.get("/api/vendors/matching", async (req, res) => {
    try {
      const { category, guestCount, location, cuisineTypes, search } = req.query;
      const guestCountNum = guestCount ? parseInt(guestCount) : void 0;
      const searchTerm = search && typeof search === "string" ? search.trim().toLowerCase() : void 0;
      const requestedCuisines = cuisineTypes && typeof cuisineTypes === "string" ? cuisineTypes.split(",").map((c) => c.trim().toLowerCase()) : [];
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
        hasReviewBadge: subscriptionTiers.hasReviewBadge
      }).from(vendors).leftJoin(
        vendorSubscriptions,
        and3(
          eq3(vendorSubscriptions.vendorId, vendors.id),
          eq3(vendorSubscriptions.status, "active")
        )
      ).leftJoin(subscriptionTiers, eq3(subscriptionTiers.id, vendorSubscriptions.tierId)).where(eq3(vendors.status, "approved"));
      let filtered = category ? vendorsWithSubs.filter((v) => v.categoryId === category) : vendorsWithSubs;
      if (searchTerm) {
        filtered = filtered.filter((v) => {
          const name = (v.businessName || "").toLowerCase();
          const desc3 = (v.description || "").toLowerCase();
          return name.includes(searchTerm) || desc3.includes(searchTerm);
        });
      }
      const vendorIds = filtered.map((v) => v.id);
      let categoryDetails = [];
      if (vendorIds.length > 0) {
        categoryDetails = await db.select().from(vendorCategoryDetails).where(inArray2(vendorCategoryDetails.vendorId, vendorIds));
      }
      const vendorsWithDetails = filtered.map((vendor) => {
        const details = categoryDetails.find((d) => d.vendorId === vendor.id) || {};
        return {
          ...vendor,
          venueCapacityMin: details.venueCapacityMin,
          venueCapacityMax: details.venueCapacityMax,
          cateringMinGuests: details.cateringMinGuests,
          cateringMaxGuests: details.cateringMaxGuests,
          venueType: details.venueType,
          venueLocation: details.venueLocation
        };
      });
      let result = vendorsWithDetails;
      if (guestCountNum && category === "venue") {
        result = result.filter((v) => {
          if (!v.venueCapacityMin && !v.venueCapacityMax) return true;
          if (v.venueCapacityMax && guestCountNum > v.venueCapacityMax) return false;
          if (v.venueCapacityMin && guestCountNum < v.venueCapacityMin * 0.7) return false;
          return true;
        });
      }
      if (guestCountNum && category === "catering") {
        result = result.filter((v) => {
          if (!v.cateringMinGuests && !v.cateringMaxGuests) return true;
          if (v.cateringMaxGuests && guestCountNum > v.cateringMaxGuests) return false;
          if (v.cateringMinGuests && guestCountNum < v.cateringMinGuests * 0.7) return false;
          return true;
        });
      }
      if (location && typeof location === "string") {
        const locationLower = location.toLowerCase();
        result = result.filter(
          (v) => v.location?.toLowerCase().includes(locationLower) || v.venueLocation?.toLowerCase().includes(locationLower)
        );
      }
      let cateringDetailsMap = {};
      if (category === "catering" && requestedCuisines.length > 0) {
      }
      result.sort((a, b) => {
        if (a.canHighlightProfile && !b.canHighlightProfile) return -1;
        if (!a.canHighlightProfile && b.canHighlightProfile) return 1;
        if (a.hasPrioritizedSearch && !b.hasPrioritizedSearch) return -1;
        if (!a.hasPrioritizedSearch && b.hasPrioritizedSearch) return 1;
        return (a.businessName || "").localeCompare(b.businessName || "");
      });
      const vendorIdsForProducts = result.map((v) => v.id);
      let vendorProductsMap = {};
      if (vendorIdsForProducts.length > 0) {
        const allProducts = await db.select().from(vendorProducts).where(inArray2(vendorProducts.vendorId, vendorIdsForProducts));
        allProducts.forEach((product) => {
          if (!vendorProductsMap[product.vendorId]) {
            vendorProductsMap[product.vendorId] = [];
          }
          vendorProductsMap[product.vendorId].push({
            ...product,
            metadata: product.metadata ? JSON.parse(product.metadata) : null
          });
        });
      }
      const response = result.map((v) => ({
        ...v,
        isFeatured: v.canHighlightProfile || false,
        isPrioritized: v.hasPrioritizedSearch || false,
        hasReviewBadge: v.hasReviewBadge || false,
        products: vendorProductsMap[v.id] || []
      }));
      res.json(response);
    } catch (error) {
      console.error("Error fetching matching vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente matchende leverand\xF8rer" });
    }
  });
  const checkAdminAuth = async (req, res) => {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers["x-api-key"];
    if (apiKey && apiKey.startsWith("ch_")) {
      try {
        const [project] = await db.select().from(creatorhubProjects).where(eq3(creatorhubProjects.apiKey, apiKey));
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
    if (authHeader && authHeader.startsWith("Bearer ch_")) {
      const key = authHeader.substring(7);
      try {
        const [project] = await db.select().from(creatorhubProjects).where(eq3(creatorhubProjects.apiKey, key));
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
  app2.get("/api/admin/vendors", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
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
      }).from(vendors).where(eq3(vendors.status, status));
      res.json(vendorList);
    } catch (error) {
      console.error("Error fetching admin vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente leverand\xF8rer" });
    }
  });
  app2.post("/api/admin/vendors/:id/approve", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { tierId } = req.body;
      await db.update(vendors).set({ status: "approved", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(vendors.id, id));
      const { vendorSubscriptions: vendorSubscriptions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [existingSubscription] = await db.select().from(vendorSubscriptions2).where(eq3(vendorSubscriptions2.vendorId, id)).limit(1);
      if (existingSubscription) {
        if (tierId && existingSubscription.tierId !== tierId) {
          await db.update(vendorSubscriptions2).set({
            tierId,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq3(vendorSubscriptions2.vendorId, id));
        }
      } else if (tierId) {
        const now = /* @__PURE__ */ new Date();
        const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1e3);
        await db.insert(vendorSubscriptions2).values({
          vendorId: id,
          tierId,
          status: "trialing",
          // Trial - requires payment
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          autoRenew: true
        });
      }
      res.json({ message: "Leverand\xF8r godkjent" });
    } catch (error) {
      console.error("Error approving vendor:", error);
      res.status(500).json({ error: "Kunne ikke godkjenne leverand\xF8r" });
    }
  });
  app2.post("/api/admin/vendors/:id/reject", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { reason } = req.body;
      await db.update(vendors).set({
        status: "rejected",
        rejectionReason: reason || null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(vendors.id, id));
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
    const [vendorSession] = await db.select({ vendorId: vendorSessions.vendorId }).from(vendorSessions).where(and3(
      eq3(vendorSessions.token, token),
      sql4`${vendorSessions.expiresAt} > NOW()`
    ));
    if (!vendorSession) {
      res.status(401).json({ error: "\xD8kt utl\xF8pt. Vennligst logg inn p\xE5 nytt." });
      return null;
    }
    const [vendor] = await db.select().from(vendors).where(eq3(vendors.id, vendorSession.vendorId));
    if (!vendor || vendor.status !== "approved") {
      res.status(401).json({ error: "Ikke autorisert" });
      return null;
    }
    return vendorSession.vendorId;
  };
  const checkVendorSubscriptionAccess = async (vendorId, res) => {
    try {
      const { vendorSubscriptions: vendorSubscriptions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [subscription] = await db.select().from(vendorSubscriptions2).where(eq3(vendorSubscriptions2.vendorId, vendorId)).limit(1);
      if (!subscription) {
        res.status(403).json({
          error: "Ingen aktivt abonnement",
          message: "Du m\xE5 ha et aktivt abonnement for \xE5 bruke denne funksjonen.",
          requiresPayment: true
        });
        return false;
      }
      if (subscription.status === "paused") {
        res.status(403).json({
          error: "Abonnement satt p\xE5 pause",
          message: "Ditt abonnement er satt p\xE5 pause. Betal for \xE5 fortsette \xE5 bruke Wedflow og motta henvendelser.",
          requiresPayment: true,
          isPaused: true
        });
        return false;
      }
      if (subscription.status === "trialing") {
        const now = /* @__PURE__ */ new Date();
        if (subscription.currentPeriodEnd < now) {
          await db.update(vendorSubscriptions2).set({
            status: "paused",
            updatedAt: now
          }).where(eq3(vendorSubscriptions2.id, subscription.id));
          res.status(403).json({
            error: "Pr\xF8veperiode utl\xF8pt",
            message: "Din 30-dagers pr\xF8veperiode har utl\xF8pt. Betal for \xE5 fortsette.",
            requiresPayment: true,
            trialExpired: true
          });
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error checking subscription access:", error);
      return true;
    }
  };
  app2.get("/api/vendor/profile", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const [vendor] = await db.select().from(vendors).where(eq3(vendors.id, vendorId));
      if (!vendor) {
        return res.status(404).json({ error: "Leverand\xF8r ikke funnet" });
      }
      let category = null;
      if (vendor.categoryId) {
        const [cat] = await db.select().from(vendorCategories).where(eq3(vendorCategories.id, vendor.categoryId));
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
  app2.get("/api/vendor/subscription/status", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { vendorSubscriptions: vendorSubscriptions2, subscriptionTiers: subscriptionTiers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [subscription] = await db.select({
        id: vendorSubscriptions2.id,
        status: vendorSubscriptions2.status,
        currentPeriodStart: vendorSubscriptions2.currentPeriodStart,
        currentPeriodEnd: vendorSubscriptions2.currentPeriodEnd,
        autoRenew: vendorSubscriptions2.autoRenew,
        tier: {
          id: subscriptionTiers2.id,
          name: subscriptionTiers2.name,
          displayName: subscriptionTiers2.displayName,
          priceNok: subscriptionTiers2.priceNok
        }
      }).from(vendorSubscriptions2).innerJoin(subscriptionTiers2, eq3(vendorSubscriptions2.tierId, subscriptionTiers2.id)).where(eq3(vendorSubscriptions2.vendorId, vendorId)).limit(1);
      if (!subscription) {
        return res.json({ hasSubscription: false });
      }
      const now = /* @__PURE__ */ new Date();
      const daysRemaining = Math.ceil(
        (subscription.currentPeriodEnd.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)
      );
      const needsPayment = subscription.status === "paused" || subscription.status === "past_due" || subscription.status === "trialing" && daysRemaining <= 0;
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
        autoRenew: subscription.autoRenew
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnementsstatus" });
    }
  });
  app2.patch("/api/vendor/profile", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { businessName, organizationNumber, description, location, phone, website, priceRange, googleReviewUrl, culturalExpertise } = req.body;
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
        culturalExpertise: culturalExpertise || null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(vendors.id, vendorId)).returning();
      res.json(updatedVendor);
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere profil" });
    }
  });
  app2.get("/api/vendor/category-details", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const [details] = await db.select().from(vendorCategoryDetails).where(eq3(vendorCategoryDetails.vendorId, vendorId));
      const [vendor] = await db.select({
        categoryId: vendors.categoryId
      }).from(vendors).where(eq3(vendors.id, vendorId));
      let categoryName = null;
      if (vendor?.categoryId) {
        const [cat] = await db.select().from(vendorCategories).where(eq3(vendorCategories.id, vendor.categoryId));
        categoryName = cat?.name || null;
      }
      res.json({
        details: details || null,
        categoryName
      });
    } catch (error) {
      console.error("Error fetching category details:", error);
      res.status(500).json({ error: "Kunne ikke hente kategori-detaljer" });
    }
  });
  app2.patch("/api/vendor/category-details", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const updateData = { ...req.body, updatedAt: /* @__PURE__ */ new Date() };
      delete updateData.id;
      delete updateData.vendorId;
      delete updateData.createdAt;
      const [existing] = await db.select().from(vendorCategoryDetails).where(eq3(vendorCategoryDetails.vendorId, vendorId));
      if (existing) {
        const [updated] = await db.update(vendorCategoryDetails).set(updateData).where(eq3(vendorCategoryDetails.vendorId, vendorId)).returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(vendorCategoryDetails).values({
          vendorId,
          ...updateData
        }).returning();
        res.json(created);
      }
    } catch (error) {
      console.error("Error updating category details:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategori-detaljer" });
    }
  });
  app2.get("/api/vendor/deliveries", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const vendorDeliveries = await db.select().from(deliveries).where(eq3(deliveries.vendorId, vendorId));
      const deliveriesWithItems = await Promise.all(
        vendorDeliveries.map(async (delivery) => {
          const items = await db.select().from(deliveryItems).where(eq3(deliveryItems.deliveryId, delivery.id));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
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
          (item, index2) => db.insert(deliveryItems).values({
            deliveryId: newDelivery.id,
            type: item.type,
            label: item.label,
            url: item.url,
            description: item.description || null,
            sortOrder: index2
          })
        )
      );
      const createdItems = await db.select().from(deliveryItems).where(eq3(deliveryItems.deliveryId, newDelivery.id));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const { items, ...deliveryData } = req.body;
      const [existing] = await db.select().from(deliveries).where(and3(
        eq3(deliveries.id, id),
        eq3(deliveries.vendorId, vendorId)
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
      }).where(eq3(deliveries.id, id)).returning();
      if (items && Array.isArray(items)) {
        await db.delete(deliveryItems).where(eq3(deliveryItems.deliveryId, id));
        await Promise.all(
          items.map(
            (item, index2) => db.insert(deliveryItems).values({
              deliveryId: id,
              type: item.type,
              label: item.label,
              url: item.url,
              description: item.description || null,
              sortOrder: index2
            })
          )
        );
      }
      const updatedItems = await db.select().from(deliveryItems).where(eq3(deliveryItems.deliveryId, id));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(deliveries).where(and3(
        eq3(deliveries.id, id),
        eq3(deliveries.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Leveranse ikke funnet" });
      }
      await db.delete(deliveryItems).where(eq3(deliveryItems.deliveryId, id));
      await db.delete(deliveries).where(eq3(deliveries.id, id));
      res.json({ message: "Leveranse slettet" });
    } catch (error) {
      console.error("Error deleting delivery:", error);
      res.status(500).json({ error: "Kunne ikke slette leveranse" });
    }
  });
  app2.get("/api/deliveries/:accessCode", async (req, res) => {
    try {
      const { accessCode } = req.params;
      const [delivery] = await db.select().from(deliveries).where(eq3(deliveries.accessCode, accessCode.toUpperCase()));
      if (!delivery || delivery.status !== "active") {
        return res.status(404).json({ error: "Leveranse ikke funnet" });
      }
      const [vendor] = await db.select({
        businessName: vendors.businessName,
        categoryId: vendors.categoryId
      }).from(vendors).where(eq3(vendors.id, delivery.vendorId));
      const items = await db.select().from(deliveryItems).where(eq3(deliveryItems.deliveryId, delivery.id));
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
      const approvedInspirations = await db.select().from(inspirations).where(eq3(inspirations.status, "approved"));
      const filtered = categoryId ? approvedInspirations.filter((i) => i.categoryId === categoryId) : approvedInspirations;
      const inspirationsWithDetails = await Promise.all(
        filtered.map(async (insp) => {
          const media = await db.select().from(inspirationMedia).where(eq3(inspirationMedia.inspirationId, insp.id));
          const [vendor] = await db.select({
            id: vendors.id,
            businessName: vendors.businessName
          }).from(vendors).where(eq3(vendors.id, insp.vendorId));
          const [category] = await db.select().from(inspirationCategories).where(eq3(inspirationCategories.id, insp.categoryId || ""));
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
      const vendorInspirations = await db.select().from(inspirations).where(eq3(inspirations.vendorId, vendorId));
      const inspirationsWithMedia = await Promise.all(
        vendorInspirations.map(async (insp) => {
          const media = await db.select().from(inspirationMedia).where(eq3(inspirationMedia.inspirationId, insp.id));
          const [category] = await db.select().from(inspirationCategories).where(eq3(inspirationCategories.id, insp.categoryId || ""));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const featureRows = await db.select().from(vendorFeatures).where(and3(eq3(vendorFeatures.vendorId, vendorId), eq3(vendorFeatures.featureKey, "inspirations")));
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
      const assignments = await db.select().from(vendorInspirationCategories).where(eq3(vendorInspirationCategories.vendorId, vendorId));
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
          (item, index2) => db.insert(inspirationMedia).values({
            inspirationId: newInspiration.id,
            type: item.type,
            url: item.url,
            caption: item.caption || null,
            sortOrder: index2
          })
        )
      );
      const createdMedia = await db.select().from(inspirationMedia).where(eq3(inspirationMedia.inspirationId, newInspiration.id));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const { media, ...inspirationData } = req.body;
      const [existing] = await db.select().from(inspirations).where(and3(
        eq3(inspirations.id, id),
        eq3(inspirations.vendorId, vendorId)
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
      }).where(eq3(inspirations.id, id)).returning();
      if (media && Array.isArray(media)) {
        await db.delete(inspirationMedia).where(eq3(inspirationMedia.inspirationId, id));
        await Promise.all(
          media.map(
            (item, index2) => db.insert(inspirationMedia).values({
              inspirationId: id,
              type: item.type,
              url: item.url,
              caption: item.caption || null,
              sortOrder: index2
            })
          )
        );
      }
      const updatedMedia = await db.select().from(inspirationMedia).where(eq3(inspirationMedia.inspirationId, id));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(inspirations).where(and3(
        eq3(inspirations.id, id),
        eq3(inspirations.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Showcase ikke funnet" });
      }
      await db.delete(inspirationMedia).where(eq3(inspirationMedia.inspirationId, id));
      await db.delete(inspirations).where(eq3(inspirations.id, id));
      res.json({ message: "Showcase slettet" });
    } catch (error) {
      console.error("Error deleting inspiration:", error);
      res.status(500).json({ error: "Kunne ikke slette showcase" });
    }
  });
  app2.get("/api/admin/inspirations", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const status = req.query.status || "pending";
      const inspirationList = await db.select().from(inspirations).where(eq3(inspirations.status, status));
      const inspirationsWithDetails = await Promise.all(
        inspirationList.map(async (insp) => {
          const media = await db.select().from(inspirationMedia).where(eq3(inspirationMedia.inspirationId, insp.id));
          const [vendor] = await db.select({
            id: vendors.id,
            businessName: vendors.businessName
          }).from(vendors).where(eq3(vendors.id, insp.vendorId));
          const [category] = await db.select().from(inspirationCategories).where(eq3(inspirationCategories.id, insp.categoryId || ""));
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
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.update(inspirations).set({ status: "approved", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(inspirations.id, id));
      res.json({ message: "Inspirasjon godkjent" });
    } catch (error) {
      console.error("Error approving inspiration:", error);
      res.status(500).json({ error: "Kunne ikke godkjenne inspirasjon" });
    }
  });
  app2.post("/api/admin/inspirations/:id/reject", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { reason } = req.body;
      await db.update(inspirations).set({
        status: "rejected",
        rejectionReason: reason || null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(inspirations.id, id));
      res.json({ message: "Inspirasjon avvist" });
    } catch (error) {
      console.error("Error rejecting inspiration:", error);
      res.status(500).json({ error: "Kunne ikke avvise inspirasjon" });
    }
  });
  app2.get("/api/admin/vendors/:id/features", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const features = await db.select().from(vendorFeatures).where(eq3(vendorFeatures.vendorId, id));
      res.json(features);
    } catch (error) {
      console.error("Error fetching vendor features:", error);
      res.status(500).json({ error: "Kunne ikke hente funksjoner" });
    }
  });
  const VALID_FEATURE_KEYS = ["deliveries", "inspirations"];
  app2.put("/api/admin/vendors/:id/features", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
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
        const existing = await db.select().from(vendorFeatures).where(and3(eq3(vendorFeatures.vendorId, id), eq3(vendorFeatures.featureKey, feature.featureKey)));
        if (existing.length > 0) {
          await db.update(vendorFeatures).set({ isEnabled: feature.isEnabled, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(vendorFeatures.vendorId, id), eq3(vendorFeatures.featureKey, feature.featureKey)));
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
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const assignments = await db.select().from(vendorInspirationCategories).where(eq3(vendorInspirationCategories.vendorId, id));
      res.json(assignments.map((a) => a.categoryId));
    } catch (error) {
      console.error("Error fetching vendor categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });
  app2.put("/api/admin/vendors/:id/inspiration-categories", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
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
      await db.delete(vendorInspirationCategories).where(eq3(vendorInspirationCategories.vendorId, id));
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
      const assignments = await db.select().from(vendorInspirationCategories).where(eq3(vendorInspirationCategories.vendorId, vendorId));
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
      const features = await db.select().from(vendorFeatures).where(eq3(vendorFeatures.vendorId, vendorId));
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
      const [inspiration] = await db.select().from(inspirations).where(eq3(inspirations.id, id));
      if (!inspiration || inspiration.status !== "approved") {
        return res.status(404).json({ error: "Inspirasjon ikke funnet" });
      }
      const featureRows = await db.select().from(vendorFeatures).where(and3(eq3(vendorFeatures.vendorId, inspiration.vendorId), eq3(vendorFeatures.featureKey, "inspirations")));
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
      const inquiries = await db.select().from(inspirationInquiries).where(eq3(inspirationInquiries.vendorId, vendorId));
      const inquiriesWithDetails = await Promise.all(
        inquiries.map(async (inq) => {
          const [insp] = await db.select({ title: inspirations.title }).from(inspirations).where(eq3(inspirations.id, inq.inspirationId));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const { status } = req.body;
      const [inquiry] = await db.select().from(inspirationInquiries).where(eq3(inspirationInquiries.id, id));
      if (!inquiry || inquiry.vendorId !== vendorId) {
        return res.status(404).json({ error: "Foresp\xF8rsel ikke funnet" });
      }
      await db.update(inspirationInquiries).set({ status }).where(eq3(inspirationInquiries.id, id));
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
    const [session] = await db.select().from(coupleSessions).where(eq3(coupleSessions.token, token));
    if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
      res.status(401).json({ error: "Sesjon utl\xF8pt" });
      return null;
    }
    COUPLE_SESSIONS.set(token, { coupleId: session.coupleId, expiresAt: session.expiresAt });
    return session.coupleId;
  }
  app2.post("/api/couples/login", async (req, res) => {
    try {
      console.log("[CoupleLogin] Login attempt for email:", req.body.email);
      console.log("[CoupleLogin] Body keys:", Object.keys(req.body || {}));
      const bodyWithDefaults = {
        ...req.body,
        displayName: req.body.displayName || req.body.email?.split("@")[0] || "User"
      };
      const validation = coupleLoginSchema.safeParse(bodyWithDefaults);
      if (!validation.success) {
        console.log("[CoupleLogin] Validation failed:", JSON.stringify(validation.error.errors));
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { email, displayName, password } = validation.data;
      const { selectedTraditions } = req.body;
      console.log("[CoupleLogin] Starting lookup for email:", email);
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
        updatedAt: coupleProfiles.updatedAt
      }).from(coupleProfiles).where(eq3(coupleProfiles.email, email));
      let couple = coupleResults[0] || null;
      let isNewRegistration = false;
      console.log("[CoupleLogin] Lookup result:", couple ? "Found" : "Not found");
      if (!couple) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [newCouple] = await db.insert(coupleProfiles).values({
          email,
          displayName,
          password: hashedPassword,
          selectedTraditions: selectedTraditions || null
        }).returning();
        couple = newCouple;
        isNewRegistration = true;
      } else {
        if (!couple.password) {
          return res.status(401).json({ error: "Kontoen din har ingen passord. Kontakt support." });
        }
        const passwordMatch = await bcrypt.compare(password, couple.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Ugyldig e-post eller passord" });
        }
        const explicitDisplayName = req.body.displayName;
        if (explicitDisplayName && couple.displayName !== explicitDisplayName) {
          await db.update(coupleProfiles).set({ displayName: explicitDisplayName, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleProfiles.id, couple.id));
          couple.displayName = explicitDisplayName;
        }
      }
      if (isNewRegistration && selectedTraditions && selectedTraditions.length > 0) {
        const primaryTradition = resolveTraditionKey(selectedTraditions[0]);
        const template = TIMELINE_TEMPLATES[primaryTradition] || DEFAULT_TIMELINE;
        const timelineValues = template.map((event) => ({
          coupleId: couple.id,
          time: event.time,
          title: event.title,
          icon: event.icon
        }));
        if (timelineValues.length > 0) {
          await db.insert(scheduleEvents).values(timelineValues);
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
  app2.post("/api/couples/logout", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      COUPLE_SESSIONS.delete(token);
      await db.delete(coupleSessions).where(eq3(coupleSessions.token, token));
    }
    res.json({ message: "Logget ut" });
  });
  app2.get("/api/couples/me", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }
      const { password: _pw, ...coupleWithoutPassword } = couple;
      res.json(coupleWithoutPassword);
    } catch (error) {
      console.error("Error fetching couple profile:", error);
      res.status(500).json({ error: "Kunne ikke hente profil" });
    }
  });
  app2.put("/api/couples/me", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { displayName, weddingDate, selectedTraditions } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (displayName !== void 0) updateData.displayName = displayName;
      if (weddingDate !== void 0) updateData.weddingDate = weddingDate;
      if (selectedTraditions !== void 0) updateData.selectedTraditions = selectedTraditions;
      const [updated] = await db.update(coupleProfiles).set(updateData).where(eq3(coupleProfiles.id, coupleId)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating couple profile:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere profil" });
    }
  });
  app2.get("/api/couples/projects", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }
      const projects = await db.execute(sql4`
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
  app2.get("/api/couples/projects/:projectId", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }
      const result = await db.execute(sql4`
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
  app2.get("/api/couples/dashboard", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }
      const { password: _pw, ...coupleData } = couple;
      const projects = await db.execute(sql4`
        SELECT p.id, p.name, p.status, p.event_date, p.location, p.budget,
               v.business_name as vendor_name, vc.name as vendor_category
        FROM legacy.projects p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN vendors v ON v.email = u.email
        LEFT JOIN vendor_categories vc ON vc.id = v.category_id
        WHERE p.client_email = ${couple.email}
        ORDER BY p.event_date DESC
      `);
      const bookings = await db.execute(sql4`
        SELECT id, client_name, date, event_type, location, status, created_at
        FROM bookings
        WHERE client_email = ${couple.email}
        ORDER BY date DESC
      `);
      const vendorList = await db.execute(sql4`
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
          totalBookings: (bookings.rows || []).length
        }
      });
    } catch (error) {
      console.error("Error fetching couple dashboard:", error);
      res.status(500).json({ error: "Kunne ikke hente dashboard" });
    }
  });
  app2.get("/api/couples/vendors", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }
      const vendorList = await db.execute(sql4`
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
      res.status(500).json({ error: "Kunne ikke hente leverand\xF8rer" });
    }
  });
  app2.get("/api/couples/conversations", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const convos = await db.select().from(conversations).where(and3(
        eq3(conversations.coupleId, coupleId),
        eq3(conversations.deletedByCouple, false)
      )).orderBy(desc2(conversations.lastMessageAt));
      const enriched = await Promise.all(convos.map(async (conv) => {
        const [vendor] = await db.select({ id: vendors.id, businessName: vendors.businessName }).from(vendors).where(eq3(vendors.id, conv.vendorId));
        let inspiration = null;
        if (conv.inspirationId) {
          const [insp] = await db.select({ id: inspirations.id, title: inspirations.title, coverImageUrl: inspirations.coverImageUrl }).from(inspirations).where(eq3(inspirations.id, conv.inspirationId));
          inspiration = insp;
        }
        const [lastMsg] = await db.select().from(messages).where(eq3(messages.conversationId, conv.id)).orderBy(desc2(messages.createdAt)).limit(1);
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
      const convos = await db.select().from(conversations).where(and3(
        eq3(conversations.vendorId, vendorId),
        eq3(conversations.deletedByVendor, false)
      )).orderBy(desc2(conversations.lastMessageAt));
      const enriched = await Promise.all(convos.map(async (conv) => {
        const [couple] = await db.select({ id: coupleProfiles.id, displayName: coupleProfiles.displayName, email: coupleProfiles.email }).from(coupleProfiles).where(eq3(coupleProfiles.id, conv.coupleId));
        let inspiration = null;
        if (conv.inspirationId) {
          const [insp] = await db.select({ id: inspirations.id, title: inspirations.title }).from(inspirations).where(eq3(inspirations.id, conv.inspirationId));
          inspiration = insp;
        }
        const [lastMsg] = await db.select().from(messages).where(eq3(messages.conversationId, conv.id)).orderBy(desc2(messages.createdAt)).limit(1);
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
      const [conv] = await db.select().from(conversations).where(and3(
        eq3(conversations.id, id),
        eq3(conversations.vendorId, vendorId)
      ));
      if (!conv) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const [couple] = await db.select({
        id: coupleProfiles.id,
        displayName: coupleProfiles.displayName,
        email: coupleProfiles.email
      }).from(coupleProfiles).where(eq3(coupleProfiles.id, conv.coupleId));
      let inspiration = null;
      if (conv.inspirationId) {
        const [insp] = await db.select({ id: inspirations.id, title: inspirations.title }).from(inspirations).where(eq3(inspirations.id, conv.inspirationId));
        inspiration = insp;
      }
      const [lastMsg] = await db.select().from(messages).where(eq3(messages.conversationId, conv.id)).orderBy(desc2(messages.createdAt)).limit(1);
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
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const msgs = await db.select().from(messages).where(and3(
        eq3(messages.conversationId, id),
        eq3(messages.deletedByCouple, false)
      )).orderBy(messages.createdAt);
      await db.update(conversations).set({ coupleUnreadCount: 0 }).where(eq3(conversations.id, id));
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
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const [vendor] = await db.select().from(vendors).where(eq3(vendors.id, conv.vendorId));
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
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const msgs = await db.select().from(messages).where(and3(
        eq3(messages.conversationId, id),
        eq3(messages.deletedByVendor, false)
      )).orderBy(messages.createdAt);
      await db.update(conversations).set({ vendorUnreadCount: 0 }).where(eq3(conversations.id, id));
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
        let [existing] = await db.select().from(conversations).where(and3(eq3(conversations.coupleId, coupleId), eq3(conversations.vendorId, vendorId)));
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
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, convId));
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
      }).where(eq3(conversations.id, convId));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { conversationId, body, attachmentUrl, attachmentType } = req.body;
      if (!conversationId || !body && !attachmentUrl) {
        return res.status(400).json({ error: "Mangler samtale-ID eller melding" });
      }
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, conversationId));
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
      }).where(eq3(conversations.id, conversationId));
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
      const existing = await db.select().from(adminConversations).where(eq3(adminConversations.vendorId, vendorId));
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
      const [conv] = await db.select().from(adminConversations).where(eq3(adminConversations.vendorId, vendorId));
      if (!conv) {
        return res.json([]);
      }
      const msgs = await db.select().from(adminMessages).where(eq3(adminMessages.conversationId, conv.id)).orderBy(desc2(adminMessages.createdAt));
      await db.update(adminConversations).set({ vendorUnreadCount: 0 }).where(eq3(adminConversations.id, conv.id));
      res.json(msgs);
    } catch (error) {
      console.error("Error fetching admin messages:", error);
      res.status(500).json({ error: "Kunne ikke hente admin-meldinger" });
    }
  });
  app2.post("/api/vendor/admin/messages", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { body, attachmentUrl, attachmentType } = req.body;
      const parse = sendAdminMessageSchema.safeParse({ body, attachmentUrl, attachmentType });
      if (!parse.success) {
        return res.status(400).json({ error: parse.error.errors[0]?.message || "Ugyldig melding" });
      }
      const [conv] = await db.select().from(adminConversations).where(eq3(adminConversations.vendorId, vendorId));
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
      }).where(eq3(adminConversations.id, conversationId));
      broadcastAdminConv(conversationId, { type: "message", payload: msg });
      broadcastAdminList({ type: "conv-update", payload: { conversationId, lastMessageAt: newLast.toISOString(), adminUnreadCount: newAdminUnread } });
      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending admin message:", error);
      res.status(500).json({ error: "Kunne ikke sende melding til admin" });
    }
  });
  app2.get("/api/admin/vendor-admin-conversations", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const rows = await db.select({
        conv: adminConversations,
        vendor: vendors
      }).from(adminConversations).leftJoin(vendors, eq3(adminConversations.vendorId, vendors.id)).orderBy(desc2(adminConversations.lastMessageAt));
      res.json(rows);
    } catch (error) {
      console.error("Error listing admin convs:", error);
      res.status(500).json({ error: "Kunne ikke liste admin-samtaler" });
    }
  });
  app2.get("/api/admin/vendor-admin-conversations/:id/messages", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const msgs = await db.select().from(adminMessages).where(eq3(adminMessages.conversationId, id)).orderBy(desc2(adminMessages.createdAt));
      await db.update(adminConversations).set({ adminUnreadCount: 0 }).where(eq3(adminConversations.id, id));
      res.json(msgs);
    } catch (error) {
      console.error("Error fetching admin msgs:", error);
      res.status(500).json({ error: "Kunne ikke hente meldinger" });
    }
  });
  app2.post("/api/admin/vendor-admin-conversations/:id/messages", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { body, attachmentUrl, attachmentType, videoGuideId } = req.body;
      const parse = sendAdminMessageSchema.safeParse({ body, attachmentUrl, attachmentType, videoGuideId });
      if (!parse.success) {
        return res.status(400).json({ error: parse.error.errors[0]?.message || "Ugyldig melding" });
      }
      const [msg] = await db.insert(adminMessages).values({
        conversationId: id,
        senderType: "admin",
        senderId: "admin",
        body,
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null,
        videoGuideId: videoGuideId || null
      }).returning();
      const newLast = /* @__PURE__ */ new Date();
      await db.update(adminConversations).set({
        lastMessageAt: newLast,
        vendorUnreadCount: sql4`COALESCE(${adminConversations.vendorUnreadCount}, 0) + 1`
      }).where(eq3(adminConversations.id, id));
      broadcastAdminConv(id, { type: "message", payload: msg });
      broadcastAdminList({ type: "conv-update", payload: { conversationId: id, lastMessageAt: newLast.toISOString() } });
      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending admin reply:", error);
      res.status(500).json({ error: "Kunne ikke sende admin-svar" });
    }
  });
  app2.post("/api/admin/vendor-admin-conversations/:id/typing", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      broadcastAdminConv(id, { type: "typing", payload: { sender: "admin", at: (/* @__PURE__ */ new Date()).toISOString() } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Kunne ikke sende skrive-status" });
    }
  });
  app2.patch("/api/admin/vendor-admin-conversations/:id/status", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["active", "resolved"].includes(status)) {
        return res.status(400).json({ error: "Ugyldig status" });
      }
      await db.update(adminConversations).set({ status }).where(eq3(adminConversations.id, id));
      broadcastAdminConv(id, { type: "status-update", payload: { status, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } });
      res.json({ success: true, status });
    } catch (error) {
      console.error("Error updating conversation status:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere status" });
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
      const [msg] = await db.select().from(messages).where(eq3(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }
      if (msg.senderType !== "couple" || msg.senderId !== coupleId) {
        return res.status(403).json({ error: "Du kan bare redigere dine egne meldinger" });
      }
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, msg.conversationId));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }
      const [updated] = await db.update(messages).set({
        body: body.trim(),
        editedAt: /* @__PURE__ */ new Date()
      }).where(eq3(messages.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error editing message:", error);
      res.status(500).json({ error: "Kunne ikke redigere melding" });
    }
  });
  app2.post("/api/vendor/conversations/:id/typing", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }
      await db.update(conversations).set({
        vendorTypingAt: /* @__PURE__ */ new Date()
      }).where(eq3(conversations.id, id));
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
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }
      await db.update(conversations).set({
        coupleTypingAt: /* @__PURE__ */ new Date()
      }).where(eq3(conversations.id, id));
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
      const [msg] = await db.select().from(messages).where(eq3(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, msg.conversationId));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne meldingen" });
      }
      await db.update(messages).set({ deletedByCouple: true, coupleDeletedAt: /* @__PURE__ */ new Date() }).where(eq3(messages.id, id));
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
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      await db.update(conversations).set({ deletedByCouple: true, coupleDeletedAt: /* @__PURE__ */ new Date() }).where(eq3(conversations.id, id));
      await db.update(messages).set({ deletedByCouple: true, coupleDeletedAt: /* @__PURE__ */ new Date() }).where(eq3(messages.conversationId, id));
      res.json({ success: true, message: "Samtale og meldinger slettet" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Kunne ikke slette samtale" });
    }
  });
  app2.delete("/api/vendor/messages/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const [msg] = await db.select().from(messages).where(eq3(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, msg.conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne meldingen" });
      }
      await db.update(messages).set({ deletedByVendor: true, vendorDeletedAt: /* @__PURE__ */ new Date() }).where(eq3(messages.id, id));
      res.json({ success: true, message: "Melding slettet" });
    } catch (error) {
      console.error("Error deleting vendor message:", error);
      res.status(500).json({ error: "Kunne ikke slette melding" });
    }
  });
  app2.patch("/api/vendor/messages/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const { body } = req.body;
      if (!body || !body.trim()) {
        return res.status(400).json({ error: "Melding kan ikke v\xE6re tom" });
      }
      const [msg] = await db.select().from(messages).where(eq3(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }
      if (msg.senderType !== "vendor") {
        return res.status(403).json({ error: "Du kan kun redigere dine egne meldinger" });
      }
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, msg.conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne meldingen" });
      }
      const [updated] = await db.update(messages).set({
        body: body.trim(),
        editedAt: /* @__PURE__ */ new Date()
      }).where(eq3(messages.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error editing vendor message:", error);
      res.status(500).json({ error: "Kunne ikke redigere melding" });
    }
  });
  app2.delete("/api/vendor/conversations/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      await db.update(conversations).set({ deletedByVendor: true, vendorDeletedAt: /* @__PURE__ */ new Date() }).where(eq3(conversations.id, id));
      await db.update(messages).set({ deletedByVendor: true, vendorDeletedAt: /* @__PURE__ */ new Date() }).where(eq3(messages.conversationId, id));
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
      const [inquiry] = await db.select().from(inspirationInquiries).where(eq3(inspirationInquiries.id, inquiryId));
      if (!inquiry) {
        return res.status(404).json({ error: "Henvendelse ikke funnet" });
      }
      let [existing] = await db.select().from(conversations).where(eq3(conversations.inquiryId, inquiryId));
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
      const [updated] = await db.update(reminders).set(updates).where(eq3(reminders.id, id)).returning();
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
      const [deleted] = await db.delete(reminders).where(eq3(reminders.id, id)).returning();
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
      const allSpeeches = await db.select().from(speeches).where(coupleId ? eq3(speeches.coupleId, coupleId) : sql4`1=1`).orderBy(speeches.sortOrder);
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
      const existingSpeeches = await db.select().from(speeches).where(coupleId ? eq3(speeches.coupleId, coupleId) : sql4`1=1`).orderBy(desc2(speeches.sortOrder));
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
        const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
        const contracts = await db.select({
          vendorId: coupleVendorContracts.vendorId,
          notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges
        }).from(coupleVendorContracts).where(and3(
          eq3(coupleVendorContracts.coupleId, coupleId),
          eq3(coupleVendorContracts.status, "active")
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
      const [updated] = await db.update(speeches).set(updates).where(eq3(speeches.id, id)).returning();
      if (!updated) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }
      if (coupleId && updated.coupleId) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
        const contracts = await db.select({
          vendorId: coupleVendorContracts.vendorId,
          notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges
        }).from(coupleVendorContracts).where(and3(
          eq3(coupleVendorContracts.coupleId, coupleId),
          eq3(coupleVendorContracts.status, "active")
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
      const [speechToDelete] = await db.select().from(speeches).where(eq3(speeches.id, id));
      const [deleted] = await db.delete(speeches).where(eq3(speeches.id, id)).returning();
      if (!deleted) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }
      if (coupleId && speechToDelete?.coupleId) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
        const contracts = await db.select({
          vendorId: coupleVendorContracts.vendorId,
          notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges
        }).from(coupleVendorContracts).where(and3(
          eq3(coupleVendorContracts.coupleId, coupleId),
          eq3(coupleVendorContracts.status, "active")
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
        await db.update(speeches).set({ sortOrder: i, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(speeches.id, orderedIds[i]));
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
        await db.update(coupleProfiles).set({ lastActiveAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleProfiles.id, coupleId));
        await db.update(messages).set({ readAt: /* @__PURE__ */ new Date() }).where(and3(
          eq3(messages.conversationId, id),
          eq3(messages.senderType, "vendor"),
          sql4`${messages.readAt} IS NULL`
        ));
        await db.update(conversations).set({ coupleUnreadCount: 0 }).where(eq3(conversations.id, id));
      } else if (userType === "vendor") {
        const vendorId = await checkVendorAuth2(req, res);
        if (!vendorId) return;
        await db.update(messages).set({ readAt: /* @__PURE__ */ new Date() }).where(and3(
          eq3(messages.conversationId, id),
          eq3(messages.senderType, "couple"),
          sql4`${messages.readAt} IS NULL`
        ));
        await db.update(conversations).set({ vendorUnreadCount: 0 }).where(eq3(conversations.id, id));
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
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, conv.coupleId));
      const convMessages = await db.select().from(messages).where(eq3(messages.conversationId, id)).orderBy(messages.createdAt);
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const { reminderType, scheduledFor } = req.body;
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, id));
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
      const pendingReminders = await db.select().from(messageReminders).where(and3(
        eq3(messageReminders.vendorId, vendorId),
        eq3(messageReminders.status, "pending")
      )).orderBy(messageReminders.scheduledFor);
      res.json(pendingReminders);
    } catch (error) {
      console.error("Error fetching message reminders:", error);
      res.status(500).json({ error: "Kunne ikke hente p\xE5minnelser" });
    }
  });
  app2.post("/api/admin/jobs/process-message-reminders", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const dueReminders = await db.select().from(messageReminders).where(and3(
        eq3(messageReminders.status, "pending"),
        sql4`${messageReminders.scheduledFor} <= NOW()`
      ));
      if (dueReminders.length === 0) {
        return res.json({ message: "Ingen p\xE5minnelser \xE5 behandle", sent: 0 });
      }
      let sent = 0;
      for (const reminder of dueReminders) {
        const [vendor] = await db.select({ businessName: vendors.businessName }).from(vendors).where(eq3(vendors.id, reminder.vendorId));
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
        await db.update(messageReminders).set({ status: "sent", sentAt: /* @__PURE__ */ new Date() }).where(eq3(messageReminders.id, reminder.id));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const [deleted] = await db.update(messageReminders).set({ status: "cancelled" }).where(and3(
        eq3(messageReminders.id, id),
        eq3(messageReminders.vendorId, vendorId)
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
      const products = await db.select().from(vendorProducts).where(and3(
        eq3(vendorProducts.vendorId, vendorId),
        eq3(vendorProducts.isArchived, false)
      )).orderBy(vendorProducts.sortOrder);
      const productsWithMetadata = products.map((p) => ({
        ...p,
        metadata: p.metadata ? JSON.parse(p.metadata) : null
      }));
      res.json(productsWithMetadata);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({ error: "Kunne ikke hente produkter" });
    }
  });
  app2.post("/api/vendor/products", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
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
        sortOrder: validatedData.sortOrder,
        trackInventory: validatedData.trackInventory,
        availableQuantity: validatedData.availableQuantity,
        bookingBuffer: validatedData.bookingBuffer,
        metadata: req.body.metadata ? JSON.stringify(req.body.metadata) : null
      }).returning();
      res.status(201).json({
        ...product,
        metadata: product.metadata ? JSON.parse(product.metadata) : null
      });
    } catch (error) {
      console.error("Error creating vendor product:", error);
      res.status(500).json({ error: "Kunne ikke opprette produkt" });
    }
  });
  app2.patch("/api/vendor/products/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const updates = req.body;
      const [existing] = await db.select().from(vendorProducts).where(and3(
        eq3(vendorProducts.id, id),
        eq3(vendorProducts.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Produkt ikke funnet" });
      }
      const updateData = { ...updates, updatedAt: /* @__PURE__ */ new Date() };
      if (updates.metadata) {
        updateData.metadata = JSON.stringify(updates.metadata);
      }
      const [updated] = await db.update(vendorProducts).set(updateData).where(eq3(vendorProducts.id, id)).returning();
      res.json({
        ...updated,
        metadata: updated.metadata ? JSON.parse(updated.metadata) : null
      });
    } catch (error) {
      console.error("Error updating vendor product:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere produkt" });
    }
  });
  app2.delete("/api/vendor/products/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const [archived] = await db.update(vendorProducts).set({ isArchived: true, updatedAt: /* @__PURE__ */ new Date() }).where(and3(
        eq3(vendorProducts.id, id),
        eq3(vendorProducts.vendorId, vendorId)
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
  app2.get("/api/vendor/availability", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { startDate, endDate } = req.query;
      let query = db.select().from(vendorAvailability).where(eq3(vendorAvailability.vendorId, vendorId));
      if (startDate && endDate) {
        query = db.select().from(vendorAvailability).where(and3(
          eq3(vendorAvailability.vendorId, vendorId),
          gte2(vendorAvailability.date, startDate),
          lte2(vendorAvailability.date, endDate)
        ));
      }
      const availability = await query.orderBy(vendorAvailability.date);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching vendor availability:", error);
      res.status(500).json({ error: "Kunne ikke hente tilgjengelighet" });
    }
  });
  app2.post("/api/vendor/availability", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const validatedData = createVendorAvailabilitySchema.parse(req.body);
      const [existing] = await db.select().from(vendorAvailability).where(and3(
        eq3(vendorAvailability.vendorId, vendorId),
        eq3(vendorAvailability.date, validatedData.date)
      ));
      if (existing) {
        const [updated] = await db.update(vendorAvailability).set({
          name: validatedData.name,
          status: validatedData.status,
          maxBookings: validatedData.maxBookings,
          notes: validatedData.notes,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(vendorAvailability.id, existing.id)).returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(vendorAvailability).values({
          vendorId,
          date: validatedData.date,
          name: validatedData.name,
          status: validatedData.status || "available",
          maxBookings: validatedData.maxBookings,
          notes: validatedData.notes
        }).returning();
        res.status(201).json(created);
      }
    } catch (error) {
      console.error("Error creating vendor availability:", error);
      res.status(500).json({ error: "Kunne ikke opprette tilgjengelighet" });
    }
  });
  app2.post("/api/vendor/availability/bulk", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { dates, status, maxBookings, name, notes } = req.body;
      if (!Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({ error: "M\xE5 oppgi minst \xE9n dato" });
      }
      if (!["available", "blocked", "limited"].includes(status)) {
        return res.status(400).json({ error: "Ugyldig status" });
      }
      const results = await Promise.all(
        dates.map(async (date2) => {
          const [existing] = await db.select().from(vendorAvailability).where(and3(
            eq3(vendorAvailability.vendorId, vendorId),
            eq3(vendorAvailability.date, date2)
          ));
          if (existing) {
            const [updated] = await db.update(vendorAvailability).set({ status, maxBookings, name, notes, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(vendorAvailability.id, existing.id)).returning();
            return updated;
          } else {
            const [created] = await db.insert(vendorAvailability).values({ vendorId, date: date2, status, maxBookings, name, notes }).returning();
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
  app2.delete("/api/vendor/availability/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(vendorAvailability).where(and3(
        eq3(vendorAvailability.id, id),
        eq3(vendorAvailability.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Tilgjengelighet ikke funnet" });
      }
      await db.delete(vendorAvailability).where(eq3(vendorAvailability.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor availability:", error);
      res.status(500).json({ error: "Kunne ikke slette tilgjengelighet" });
    }
  });
  app2.delete("/api/vendor/availability/date/:date", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { date: date2 } = req.params;
      await db.delete(vendorAvailability).where(and3(
        eq3(vendorAvailability.vendorId, vendorId),
        eq3(vendorAvailability.date, date2)
      ));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor availability by date:", error);
      res.status(500).json({ error: "Kunne ikke slette tilgjengelighet" });
    }
  });
  app2.get("/api/vendor/availability/:date/bookings", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { date: date2 } = req.params;
      const acceptedOffers = await db.select({
        offer: vendorOffers,
        weddingDate: coupleProfiles.weddingDate
      }).from(vendorOffers).leftJoin(coupleProfiles, eq3(vendorOffers.coupleId, coupleProfiles.id)).where(and3(
        eq3(vendorOffers.vendorId, vendorId),
        eq3(vendorOffers.status, "accepted"),
        eq3(coupleProfiles.weddingDate, date2)
      ));
      res.json({
        date: date2,
        acceptedBookings: acceptedOffers.length
      });
    } catch (error) {
      console.error("Error fetching bookings for date:", error);
      res.status(500).json({ error: "Kunne ikke hente bookinger" });
    }
  });
  app2.get("/api/vendors/:vendorId/availability", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { date: date2 } = req.query;
      if (!date2) {
        return res.status(400).json({ error: "M\xE5 oppgi dato" });
      }
      const [availability] = await db.select().from(vendorAvailability).where(and3(
        eq3(vendorAvailability.vendorId, vendorId),
        eq3(vendorAvailability.date, date2)
      ));
      if (!availability) {
        res.json({ status: "available", isAvailable: true });
      } else {
        res.json({
          status: availability.status,
          isAvailable: availability.status !== "blocked",
          maxBookings: availability.maxBookings
        });
      }
    } catch (error) {
      console.error("Error checking vendor availability:", error);
      res.status(500).json({ error: "Kunne ikke sjekke tilgjengelighet" });
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
      }).from(vendorOffers).leftJoin(coupleProfiles, eq3(vendorOffers.coupleId, coupleProfiles.id)).where(eq3(vendorOffers.vendorId, vendorId)).orderBy(desc2(vendorOffers.createdAt));
      const offersWithItems = await Promise.all(
        offers.map(async ({ offer, couple }) => {
          const items = await db.select().from(vendorOfferItems).where(eq3(vendorOfferItems.offerId, offer.id)).orderBy(vendorOfferItems.sortOrder);
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const validatedData = createOfferSchema.parse(req.body);
      const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, validatedData.coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Par ikke funnet" });
      }
      const targetWeddingDate = couple.weddingDate;
      if (targetWeddingDate) {
        const [availability] = await db.select().from(vendorAvailability).where(and3(
          eq3(vendorAvailability.vendorId, vendorId),
          eq3(vendorAvailability.date, targetWeddingDate)
        ));
        if (availability?.status === "blocked") {
          return res.status(400).json({
            error: `Du er ikke tilgjengelig p\xE5 ${new Date(targetWeddingDate).toLocaleDateString("nb-NO")}`,
            code: "VENDOR_BLOCKED"
          });
        }
        if (availability?.maxBookings !== null && availability?.maxBookings !== void 0) {
          const [existingBookings] = await db.select({ count: sql4`count(*)` }).from(vendorOffers).innerJoin(coupleProfiles, eq3(vendorOffers.coupleId, coupleProfiles.id)).where(and3(
            eq3(vendorOffers.vendorId, vendorId),
            eq3(coupleProfiles.weddingDate, targetWeddingDate),
            eq3(vendorOffers.status, "accepted")
          ));
          if (existingBookings && existingBookings.count >= availability.maxBookings) {
            return res.status(400).json({
              error: `Maksimalt antall bookinger (${availability.maxBookings}) for ${new Date(targetWeddingDate).toLocaleDateString("nb-NO")} er n\xE5dd`,
              code: "MAX_BOOKINGS_REACHED"
            });
          }
        }
      }
      const inventoryErrors = [];
      for (const item of validatedData.items) {
        if (!item.productId) continue;
        const [product] = await db.select().from(vendorProducts).where(eq3(vendorProducts.id, item.productId));
        if (!product || !product.trackInventory) continue;
        let reservedForDate = 0;
        if (targetWeddingDate) {
          const existingOffers = await db.select({
            quantity: vendorOfferItems.quantity
          }).from(vendorOfferItems).innerJoin(vendorOffers, eq3(vendorOfferItems.offerId, vendorOffers.id)).innerJoin(coupleProfiles, eq3(vendorOffers.coupleId, coupleProfiles.id)).where(and3(
            eq3(vendorOfferItems.productId, item.productId),
            eq3(coupleProfiles.weddingDate, targetWeddingDate),
            or2(
              eq3(vendorOffers.status, "pending"),
              eq3(vendorOffers.status, "accepted")
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
        validatedData.items.map(async (item, index2) => {
          const [offerItem] = await db.insert(vendorOfferItems).values({
            offerId: offer.id,
            productId: item.productId || null,
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
            sortOrder: index2
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
        }).where(eq3(conversations.id, validatedData.conversationId));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const updates = req.body;
      const [existing] = await db.select().from(vendorOffers).where(and3(
        eq3(vendorOffers.id, id),
        eq3(vendorOffers.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Tilbud ikke funnet" });
      }
      const [updated] = await db.update(vendorOffers).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(vendorOffers.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor offer:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tilbud" });
    }
  });
  app2.delete("/api/vendor/offers/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(vendorOffers).where(and3(
        eq3(vendorOffers.id, id),
        eq3(vendorOffers.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Tilbud ikke funnet" });
      }
      await db.delete(vendorOfferItems).where(eq3(vendorOfferItems.offerId, id));
      await db.delete(vendorOffers).where(eq3(vendorOffers.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor offer:", error);
      res.status(500).json({ error: "Kunne ikke slette tilbud" });
    }
  });
  const plannerKey = (kind, vendorId) => `vendor_planner_${kind}_${vendorId}`;
  app2.get("/api/vendor/planner/:kind", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { kind } = req.params;
      if (!["meetings", "tasks", "timeline"].includes(kind)) {
        return res.status(400).json({ error: "Ugyldig planner-type" });
      }
      const key = plannerKey(kind, vendorId);
      const [setting] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      const value = setting?.value ? JSON.parse(setting.value) : kind === "timeline" ? [] : [];
      res.json(value);
    } catch (error) {
      console.error("Error fetching vendor planner items:", error);
      res.status(500).json({ error: "Kunne ikke hente planner-data" });
    }
  });
  app2.post("/api/vendor/planner/:kind", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { kind } = req.params;
      if (!["meetings", "tasks", "timeline"].includes(kind)) {
        return res.status(400).json({ error: "Ugyldig planner-type" });
      }
      const key = plannerKey(kind, vendorId);
      const payload = req.body;
      const json = JSON.stringify(payload);
      const [existing] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      if (existing) {
        await db.update(appSettings).set({ value: json, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value: json, category: "vendor_planner" });
      }
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving vendor planner items:", error);
      res.status(500).json({ error: "Kunne ikke lagre planner-data" });
    }
  });
  app2.patch("/api/vendor/planner/:kind", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { kind } = req.params;
      if (!["meetings", "tasks", "timeline"].includes(kind)) {
        return res.status(400).json({ error: "Ugyldig planner-type" });
      }
      const key = plannerKey(kind, vendorId);
      const payload = req.body;
      const json = JSON.stringify(payload);
      const [existing] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      if (!existing) {
        return res.status(404).json({ error: "Planner-data ikke funnet" });
      }
      const [updated] = await db.update(appSettings).set({ value: json, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(appSettings.key, key)).returning();
      res.json({ success: true, updated });
    } catch (error) {
      console.error("Error updating vendor planner items:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere planner-data" });
    }
  });
  app2.delete("/api/vendor/planner/:kind", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { kind } = req.params;
      if (!["meetings", "tasks", "timeline"].includes(kind)) {
        return res.status(400).json({ error: "Ugyldig planner-type" });
      }
      const key = plannerKey(kind, vendorId);
      await db.delete(appSettings).where(eq3(appSettings.key, key));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor planner items:", error);
      res.status(500).json({ error: "Kunne ikke slette planner-data" });
    }
  });
  const coupleVenueKey = (kind, coupleId) => `couple_venue_${kind}_${coupleId}`;
  const getCoupleIdFromReq = async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ error: "Ikke autentisert" });
      return null;
    }
    let coupleId = COUPLE_SESSIONS.get(token)?.coupleId;
    if (!coupleId) {
      const [session] = await db.select().from(coupleSessions).where(eq3(coupleSessions.token, token));
      if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
        res.status(401).json({ error: "Ugyldig \xF8kt" });
        return null;
      }
      coupleId = session.coupleId;
      COUPLE_SESSIONS.set(token, { coupleId, expiresAt: session.expiresAt });
    }
    return coupleId;
  };
  const backfillCoupleVenueFromSettings = async (kind, coupleId) => {
    const key = coupleVenueKey(kind, coupleId);
    const [setting] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
    if (!setting?.value) return null;
    const parsed = JSON.parse(setting.value);
    try {
      if (kind === "bookings" && Array.isArray(parsed)) {
        await db.transaction(async (tx) => {
          await tx.delete(coupleVenueBookings).where(eq3(coupleVenueBookings.coupleId, coupleId));
          if (parsed.length === 0) return;
          await tx.insert(coupleVenueBookings).values(
            parsed.map((b) => ({
              id: b.id || crypto3.randomUUID(),
              coupleId,
              venueName: b.venueName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              completed: !!b.completed
            }))
          );
        });
      }
      if (kind === "timeline" && parsed && typeof parsed === "object") {
        await db.insert(coupleVenueTimelines).values({
          coupleId,
          venueSelected: !!parsed.venueSelected,
          venueVisited: !!parsed.venueVisited,
          contractSigned: !!parsed.contractSigned,
          depositPaid: !!parsed.depositPaid,
          capacity: parsed.capacity ?? null,
          budget: parsed.budget ?? null
        }).onConflictDoUpdate({
          target: coupleVenueTimelines.coupleId,
          set: {
            venueSelected: !!parsed.venueSelected,
            venueVisited: !!parsed.venueVisited,
            contractSigned: !!parsed.contractSigned,
            depositPaid: !!parsed.depositPaid,
            capacity: parsed.capacity ?? null,
            budget: parsed.budget ?? null,
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
      }
    } catch (err) {
      console.error("Backfill couple venue from appSettings failed", err);
    }
    return parsed;
  };
  app2.get("/api/couple/venue/:kind", async (req, res) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    const { kind } = req.params;
    if (!["bookings", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const rows = await db.select().from(coupleVenueBookings).where(eq3(coupleVenueBookings.coupleId, coupleId)).orderBy(desc2(coupleVenueBookings.createdAt));
        if (rows.length > 0) {
          return res.json(rows.map((r) => ({
            id: r.id,
            venueName: r.venueName,
            date: r.date,
            time: r.time ?? void 0,
            location: r.location ?? void 0,
            capacity: r.capacity ?? void 0,
            notes: r.notes ?? void 0,
            vendorVisitCompleted: !!r.vendorVisitCompleted,
            createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
            updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt
          })));
        }
        const fallback2 = await backfillCoupleVenueFromSettings(kind, coupleId);
        return res.json(Array.isArray(fallback2) ? fallback2 : []);
      }
      const [timeline] = await db.select().from(coupleVenueTimelines).where(eq3(coupleVenueTimelines.coupleId, coupleId));
      if (timeline) {
        return res.json({
          venueSelected: !!timeline.venueSelected,
          venueVisited: !!timeline.venueVisited,
          contractSigned: !!timeline.contractSigned,
          depositPaid: !!timeline.depositPaid,
          capacity: timeline.capacity ?? void 0,
          budget: timeline.budget ?? void 0
        });
      }
      const fallback = await backfillCoupleVenueFromSettings(kind, coupleId);
      return res.json(fallback && typeof fallback === "object" ? fallback : {});
    } catch (error) {
      console.error("Error fetching couple venue data:", error);
      res.status(500).json({ error: "Kunne ikke hente data" });
    }
  });
  app2.post("/api/couple/venue/:kind", async (req, res) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    const { kind } = req.params;
    if (!["bookings", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const payload2 = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(coupleVenueBookings).where(eq3(coupleVenueBookings.coupleId, coupleId));
          if (payload2.length === 0) return;
          await tx.insert(coupleVenueBookings).values(
            payload2.map((b) => ({
              id: b.id || crypto3.randomUUID(),
              coupleId,
              venueName: b.venueName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              completed: !!b.completed
            }))
          );
        });
        return res.status(201).json({ success: true });
      }
      const payload = req.body || {};
      await db.insert(coupleVenueTimelines).values({
        coupleId,
        venueSelected: !!payload.venueSelected,
        venueVisited: !!payload.venueVisited,
        contractSigned: !!payload.contractSigned,
        depositPaid: !!payload.depositPaid,
        capacity: payload.capacity ?? null,
        budget: payload.budget ?? null
      }).onConflictDoUpdate({
        target: coupleVenueTimelines.coupleId,
        set: {
          venueSelected: !!payload.venueSelected,
          venueVisited: !!payload.venueVisited,
          contractSigned: !!payload.contractSigned,
          depositPaid: !!payload.depositPaid,
          capacity: payload.capacity ?? null,
          budget: payload.budget ?? null,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving couple venue data:", error);
      res.status(500).json({ error: "Kunne ikke lagre" });
    }
  });
  app2.patch("/api/couple/venue/:kind", async (req, res) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    const { kind } = req.params;
    if (!["bookings", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const payload2 = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(coupleVenueBookings).where(eq3(coupleVenueBookings.coupleId, coupleId));
          if (payload2.length === 0) return;
          await tx.insert(coupleVenueBookings).values(
            payload2.map((b) => ({
              id: b.id || crypto3.randomUUID(),
              coupleId,
              venueName: b.venueName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              completed: !!b.completed
            }))
          );
        });
        return res.json({ success: true });
      }
      const payload = req.body || {};
      await db.insert(coupleVenueTimelines).values({
        coupleId,
        venueSelected: !!payload.venueSelected,
        venueVisited: !!payload.venueVisited,
        contractSigned: !!payload.contractSigned,
        depositPaid: !!payload.depositPaid,
        capacity: payload.capacity ?? null,
        budget: payload.budget ?? null
      }).onConflictDoUpdate({
        target: coupleVenueTimelines.coupleId,
        set: {
          venueSelected: !!payload.venueSelected,
          venueVisited: !!payload.venueVisited,
          contractSigned: !!payload.contractSigned,
          depositPaid: !!payload.depositPaid,
          capacity: payload.capacity ?? null,
          budget: payload.budget ?? null,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      return res.json({ success: true });
    } catch (error) {
      console.error("Error updating couple venue data:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere" });
    }
  });
  app2.delete("/api/couple/venue/:kind", async (req, res) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    const { kind } = req.params;
    if (!["bookings", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        await db.delete(coupleVenueBookings).where(eq3(coupleVenueBookings.coupleId, coupleId));
        return res.json({ success: true });
      }
      await db.delete(coupleVenueTimelines).where(eq3(coupleVenueTimelines.coupleId, coupleId));
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting couple venue data:", error);
      res.status(500).json({ error: "Kunne ikke slette" });
    }
  });
  const coupleSeatingKey = (coupleId) => `couple_venue_seating_${coupleId}`;
  app2.get("/api/couple/venue/seating", async (req, res) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    try {
      const key = coupleSeatingKey(coupleId);
      const [setting] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      const seating = setting?.value ? JSON.parse(setting.value) : { tables: [], guests: [] };
      return res.json(seating);
    } catch (error) {
      console.error("Error fetching couple seating:", error);
      res.status(500).json({ error: "Kunne ikke hente seating" });
    }
  });
  app2.post("/api/couple/venue/seating", async (req, res) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    try {
      const key = coupleSeatingKey(coupleId);
      const payload = req.body || { tables: [], guests: [] };
      const json = JSON.stringify(payload);
      const [existing] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      if (existing) {
        await db.update(appSettings).set({ value: json, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value: json, category: "couple_venue_seating" });
      }
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving couple seating:", error);
      res.status(500).json({ error: "Kunne ikke lagre seating" });
    }
  });
  const vendorVenueKey = (kind, vendorId) => `vendor_venue_${kind}_${vendorId}`;
  const backfillVendorVenueFromSettings = async (kind, vendorId) => {
    const key = vendorVenueKey(kind, vendorId);
    const [setting] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
    if (!setting?.value) return null;
    const parsed = JSON.parse(setting.value);
    try {
      if (kind === "bookings" && Array.isArray(parsed)) {
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueBookings).where(eq3(vendorVenueBookings.vendorId, vendorId));
          if (parsed.length === 0) return;
          await tx.insert(vendorVenueBookings).values(
            parsed.map((b) => ({
              id: b.id || crypto3.randomUUID(),
              vendorId,
              coupleName: b.coupleName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              status: b.status || "booked",
              completed: !!b.completed
            }))
          );
        });
      }
      if (kind === "availability" && Array.isArray(parsed)) {
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueAvailability).where(eq3(vendorVenueAvailability.vendorId, vendorId));
          if (parsed.length === 0) return;
          await tx.insert(vendorVenueAvailability).values(
            parsed.map((a) => ({
              id: a.id || crypto3.randomUUID(),
              vendorId,
              date: a.date,
              status: a.status || "available",
              maxBookings: a.maxBookings ?? null,
              notes: a.notes
            }))
          );
        });
      }
      if (kind === "timeline" && parsed && typeof parsed === "object") {
        await db.insert(vendorVenueTimelines).values({
          vendorId,
          siteVisitDone: !!parsed.siteVisitDone,
          contractSigned: !!parsed.contractSigned,
          depositReceived: !!parsed.depositReceived,
          floorPlanFinalized: !!parsed.floorPlanFinalized
        }).onConflictDoUpdate({
          target: vendorVenueTimelines.vendorId,
          set: {
            siteVisitDone: !!parsed.siteVisitDone,
            contractSigned: !!parsed.contractSigned,
            depositReceived: !!parsed.depositReceived,
            floorPlanFinalized: !!parsed.floorPlanFinalized,
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
      }
    } catch (err) {
      console.error("Backfill vendor venue from appSettings failed", err);
    }
    return parsed;
  };
  app2.get("/api/vendor/venue/:kind", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    const { kind } = req.params;
    if (!["bookings", "availability", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const rows = await db.select().from(vendorVenueBookings).where(eq3(vendorVenueBookings.vendorId, vendorId)).orderBy(desc2(vendorVenueBookings.createdAt));
        if (rows.length > 0) {
          return res.json(rows.map((r) => ({
            id: r.id,
            coupleName: r.coupleName,
            date: r.date,
            time: r.time ?? void 0,
            location: r.location ?? void 0,
            capacity: r.capacity ?? void 0,
            notes: r.notes ?? void 0,
            status: r.status || "booked",
            createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
            updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt
          })));
        }
        const fallback2 = await backfillVendorVenueFromSettings(kind, vendorId);
        return res.json(Array.isArray(fallback2) ? fallback2 : []);
      }
      if (kind === "availability") {
        const rows = await db.select().from(vendorVenueAvailability).where(eq3(vendorVenueAvailability.vendorId, vendorId)).orderBy(desc2(vendorVenueAvailability.date));
        if (rows.length > 0) {
          return res.json(rows.map((r) => ({
            id: r.id,
            date: r.date,
            status: r.status || "available",
            maxBookings: r.maxBookings ?? void 0,
            notes: r.notes ?? void 0
          })));
        }
        const fallback2 = await backfillVendorVenueFromSettings(kind, vendorId);
        return res.json(Array.isArray(fallback2) ? fallback2 : []);
      }
      const [timeline] = await db.select().from(vendorVenueTimelines).where(eq3(vendorVenueTimelines.vendorId, vendorId));
      if (timeline) {
        return res.json({
          siteVisitDone: !!timeline.siteVisitDone,
          contractSigned: !!timeline.contractSigned,
          depositReceived: !!timeline.depositReceived,
          floorPlanFinalized: !!timeline.floorPlanFinalized
        });
      }
      const fallback = await backfillVendorVenueFromSettings(kind, vendorId);
      return res.json(fallback && typeof fallback === "object" ? fallback : {});
    } catch (error) {
      console.error("Error fetching vendor venue data:", error);
      res.status(500).json({ error: "Kunne ikke hente data" });
    }
  });
  app2.post("/api/vendor/venue/:kind", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    const { kind } = req.params;
    if (!["bookings", "availability", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const payload2 = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueBookings).where(eq3(vendorVenueBookings.vendorId, vendorId));
          if (payload2.length === 0) return;
          await tx.insert(vendorVenueBookings).values(
            payload2.map((b) => ({
              id: b.id || crypto3.randomUUID(),
              vendorId,
              coupleName: b.coupleName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              status: b.status || "booked",
              completed: !!b.completed
            }))
          );
        });
        return res.status(201).json({ success: true });
      }
      if (kind === "availability") {
        const payload2 = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueAvailability).where(eq3(vendorVenueAvailability.vendorId, vendorId));
          if (payload2.length === 0) return;
          await tx.insert(vendorVenueAvailability).values(
            payload2.map((a) => ({
              id: a.id || crypto3.randomUUID(),
              vendorId,
              date: a.date,
              status: a.status || "available",
              maxBookings: a.maxBookings ?? null,
              notes: a.notes
            }))
          );
        });
        return res.status(201).json({ success: true });
      }
      const payload = req.body || {};
      await db.insert(vendorVenueTimelines).values({
        vendorId,
        siteVisitDone: !!payload.siteVisitDone,
        contractSigned: !!payload.contractSigned,
        depositReceived: !!payload.depositReceived,
        floorPlanFinalized: !!payload.floorPlanFinalized
      }).onConflictDoUpdate({
        target: vendorVenueTimelines.vendorId,
        set: {
          siteVisitDone: !!payload.siteVisitDone,
          contractSigned: !!payload.contractSigned,
          depositReceived: !!payload.depositReceived,
          floorPlanFinalized: !!payload.floorPlanFinalized,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving vendor venue data:", error);
      res.status(500).json({ error: "Kunne ikke lagre" });
    }
  });
  app2.patch("/api/vendor/venue/:kind", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    const { kind } = req.params;
    if (!["bookings", "availability", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const payload2 = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueBookings).where(eq3(vendorVenueBookings.vendorId, vendorId));
          if (payload2.length === 0) return;
          await tx.insert(vendorVenueBookings).values(
            payload2.map((b) => ({
              id: b.id || crypto3.randomUUID(),
              vendorId,
              coupleName: b.coupleName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              status: b.status || "booked",
              completed: !!b.completed
            }))
          );
        });
        return res.json({ success: true });
      }
      if (kind === "availability") {
        const payload2 = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueAvailability).where(eq3(vendorVenueAvailability.vendorId, vendorId));
          if (payload2.length === 0) return;
          await tx.insert(vendorVenueAvailability).values(
            payload2.map((a) => ({
              id: a.id || crypto3.randomUUID(),
              vendorId,
              date: a.date,
              status: a.status || "available",
              maxBookings: a.maxBookings ?? null,
              notes: a.notes
            }))
          );
        });
        return res.json({ success: true });
      }
      const payload = req.body || {};
      await db.insert(vendorVenueTimelines).values({
        vendorId,
        siteVisitDone: !!payload.siteVisitDone,
        contractSigned: !!payload.contractSigned,
        depositReceived: !!payload.depositReceived,
        floorPlanFinalized: !!payload.floorPlanFinalized
      }).onConflictDoUpdate({
        target: vendorVenueTimelines.vendorId,
        set: {
          siteVisitDone: !!payload.siteVisitDone,
          contractSigned: !!payload.contractSigned,
          depositReceived: !!payload.depositReceived,
          floorPlanFinalized: !!payload.floorPlanFinalized,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      return res.json({ success: true });
    } catch (error) {
      console.error("Error updating vendor venue data:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere" });
    }
  });
  app2.delete("/api/vendor/venue/:kind", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    const { kind } = req.params;
    if (!["bookings", "availability", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        await db.delete(vendorVenueBookings).where(eq3(vendorVenueBookings.vendorId, vendorId));
        return res.json({ success: true });
      }
      if (kind === "availability") {
        await db.delete(vendorVenueAvailability).where(eq3(vendorVenueAvailability.vendorId, vendorId));
        return res.json({ success: true });
      }
      await db.delete(vendorVenueTimelines).where(eq3(vendorVenueTimelines.vendorId, vendorId));
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor venue data:", error);
      res.status(500).json({ error: "Kunne ikke slette" });
    }
  });
  const vendorSeatingKey = (vendorId) => `vendor_venue_seating_${vendorId}`;
  app2.get("/api/vendor/venue/seating", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const key = vendorSeatingKey(vendorId);
      const [setting] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      const seating = setting?.value ? JSON.parse(setting.value) : { tables: [], guests: [] };
      return res.json(seating);
    } catch (error) {
      console.error("Error fetching vendor seating:", error);
      res.status(500).json({ error: "Kunne ikke hente seating" });
    }
  });
  app2.post("/api/vendor/venue/seating", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const key = vendorSeatingKey(vendorId);
      const payload = req.body || { tables: [], guests: [] };
      const json = JSON.stringify(payload);
      const [existing] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      if (existing) {
        await db.update(appSettings).set({ value: json, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value: json, category: "vendor_venue_seating" });
      }
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving vendor seating:", error);
      res.status(500).json({ error: "Kunne ikke lagre seating" });
    }
  });
  app2.get("/api/vendor/site-visits", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
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
        vendorVisitCompleted: coupleVenueBookings.vendorVisitCompleted
      }).from(coupleVenueBookings).innerJoin(coupleProfiles, eq3(coupleVenueBookings.coupleId, coupleProfiles.id)).where(and3(
        eq3(coupleVenueBookings.vendorId, vendorId),
        isNotNull(coupleVenueBookings.siteVisitDate)
      )).orderBy(coupleVenueBookings.siteVisitDate, coupleVenueBookings.siteVisitTime);
      res.json(siteVisits);
    } catch (error) {
      console.error("Error fetching vendor site visits:", error);
      res.status(500).json({ error: "Kunne ikke hente befaringer" });
    }
  });
  app2.patch("/api/vendor/site-visits/:id", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { id } = req.params;
      const { vendorVisitConfirmed, vendorVisitNotes, vendorVisitCompleted } = req.body;
      const [existing] = await db.select().from(coupleVenueBookings).where(and3(
        eq3(coupleVenueBookings.id, id),
        eq3(coupleVenueBookings.vendorId, vendorId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Befaring ikke funnet" });
      }
      const [updated] = await db.update(coupleVenueBookings).set({
        vendorVisitConfirmed: vendorVisitConfirmed ?? existing.vendorVisitConfirmed,
        vendorVisitNotes: vendorVisitNotes ?? existing.vendorVisitNotes,
        vendorVisitCompleted: vendorVisitCompleted ?? existing.vendorVisitCompleted,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(coupleVenueBookings.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating site visit:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere befaring" });
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
        const [session] = await db.select().from(coupleSessions).where(eq3(coupleSessions.token, token));
        if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
          return res.status(401).json({ error: "Ugyldig \xF8kt" });
        }
        coupleId = session.coupleId;
        COUPLE_SESSIONS.set(token, { coupleId, expiresAt: session.expiresAt });
      }
      const { id } = req.params;
      const { response } = req.body;
      const [offer] = await db.select().from(vendorOffers).where(and3(
        eq3(vendorOffers.id, id),
        eq3(vendorOffers.coupleId, coupleId)
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
        try {
          await db.transaction(async (tx) => {
            const offerItems = await tx.select().from(vendorOfferItems).where(eq3(vendorOfferItems.offerId, id));
            for (const item of offerItems) {
              if (!item.productId) continue;
              const [product] = await tx.select().from(vendorProducts).where(eq3(vendorProducts.id, item.productId));
              if (product?.trackInventory && product.availableQuantity !== null) {
                if (product.availableQuantity < (item.quantity || 0)) {
                  throw new Error(`Ikke nok p\xE5 lager av "${product.title}". Tilgjengelig: ${product.availableQuantity}, \xD8nsket: ${item.quantity}`);
                }
                const newQuantity = product.availableQuantity - (item.quantity || 0);
                await tx.update(vendorProducts).set({
                  availableQuantity: newQuantity,
                  updatedAt: /* @__PURE__ */ new Date()
                }).where(eq3(vendorProducts.id, item.productId));
              }
            }
            await tx.insert(coupleVendorContracts).values({
              coupleId,
              vendorId: offer.vendorId,
              offerId: offer.id,
              status: "active"
            });
            await tx.update(vendorOffers).set(updates).where(eq3(vendorOffers.id, id));
          });
        } catch (txError) {
          console.error("Transaction error accepting offer:", txError);
          return res.status(400).json({
            error: txError.message || "Kunne ikke akseptere tilbud - lagerstatus endret"
          });
        }
        const [updated2] = await db.select().from(vendorOffers).where(eq3(vendorOffers.id, id));
        if (offer.conversationId) {
          await db.insert(messages).values({
            conversationId: offer.conversationId,
            senderType: "couple",
            senderId: coupleId,
            body: `\u2705 Tilbud "${offer.title}" er akseptert`
          });
          await db.update(conversations).set({
            lastMessageAt: /* @__PURE__ */ new Date(),
            vendorUnreadCount: 1
          }).where(eq3(conversations.id, offer.conversationId));
        }
        return res.json(updated2);
      } else {
        updates.declinedAt = /* @__PURE__ */ new Date();
      }
      const [updated] = await db.update(vendorOffers).set(updates).where(eq3(vendorOffers.id, id)).returning();
      if (offer.conversationId) {
        await db.insert(messages).values({
          conversationId: offer.conversationId,
          senderType: "couple",
          senderId: coupleId,
          body: `\u2705 Tilbud "${offer.title}" er avsl\xE5tt`
        });
        await db.update(conversations).set({
          lastMessageAt: /* @__PURE__ */ new Date(),
          vendorUnreadCount: 1
        }).where(eq3(conversations.id, offer.conversationId));
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
        const [session] = await db.select().from(coupleSessions).where(eq3(coupleSessions.token, token));
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
      }).from(vendorOffers).leftJoin(vendors, eq3(vendorOffers.vendorId, vendors.id)).where(eq3(vendorOffers.coupleId, coupleId)).orderBy(desc2(vendorOffers.createdAt));
      const offersWithItems = await Promise.all(
        offers.map(async ({ offer, vendor }) => {
          const items = await db.select({
            item: vendorOfferItems,
            product: vendorProducts
          }).from(vendorOfferItems).leftJoin(vendorProducts, eq3(vendorOfferItems.productId, vendorProducts.id)).where(eq3(vendorOfferItems.offerId, offer.id)).orderBy(vendorOfferItems.sortOrder);
          const itemsWithMetadata = items.map(({ item, product }) => ({
            ...item,
            product: product ? {
              ...product,
              metadata: product.metadata ? JSON.parse(product.metadata) : null
            } : null
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
      }).from(conversations).leftJoin(coupleProfiles, eq3(conversations.coupleId, coupleProfiles.id)).where(and3(
        eq3(conversations.vendorId, session.vendorId),
        eq3(conversations.status, "active"),
        eq3(conversations.deletedByVendor, false)
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
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { settings: settingsArray } = req.body;
      for (const setting of settingsArray) {
        const existing = await db.select().from(appSettings).where(eq3(appSettings.key, setting.key));
        if (existing.length > 0) {
          await db.update(appSettings).set({ value: setting.value, category: setting.category, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(appSettings.key, setting.key));
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
    if (!await checkAdminAuth(req, res)) return;
    try {
      const [vendorCount] = await db.select({ count: sql4`count(*)` }).from(vendors);
      const [approvedVendors] = await db.select({ count: sql4`count(*)` }).from(vendors).where(eq3(vendors.status, "approved"));
      const [pendingVendors] = await db.select({ count: sql4`count(*)` }).from(vendors).where(eq3(vendors.status, "pending"));
      const [coupleCount] = await db.select({ count: sql4`count(*)` }).from(coupleProfiles);
      const [inspirationCount] = await db.select({ count: sql4`count(*)` }).from(inspirations);
      const [pendingInspirations] = await db.select({ count: sql4`count(*)` }).from(inspirations).where(eq3(inspirations.status, "pending"));
      const [conversationCount] = await db.select({ count: sql4`count(*)` }).from(conversations);
      const [messageCount] = await db.select({ count: sql4`count(*)` }).from(messages);
      const [deliveryCount] = await db.select({ count: sql4`count(*)` }).from(deliveries);
      const [offerCount] = await db.select({ count: sql4`count(*)` }).from(vendorOffers);
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
  app2.get("/api/admin/preview/couple/users", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const coupleData = await db.select({
        id: coupleProfiles.id,
        name: coupleProfiles.displayName,
        email: coupleProfiles.email
      }).from(coupleProfiles).limit(50);
      const mappedUsers = coupleData.map((user) => ({
        id: user.id,
        name: user.name || "Ukjent brudepar",
        email: user.email
      }));
      res.json({
        role: "couple",
        users: mappedUsers
      });
    } catch (error) {
      console.error("Error fetching couple list:", error);
      res.status(500).json({ error: "Kunne ikke hente brudepar-liste" });
    }
  });
  app2.get("/api/admin/preview/vendor/users", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const vendorData = await db.select({
        id: vendors.id,
        name: vendors.businessName,
        email: vendors.email,
        categoryId: vendors.categoryId
      }).from(vendors).where(eq3(vendors.status, "approved")).limit(50);
      const mappedUsers = vendorData.map((user) => ({
        id: user.id,
        name: user.name || "Ukjent leverand\xF8r",
        email: user.email,
        categoryId: user.categoryId
      }));
      res.json({
        role: "vendor",
        users: mappedUsers
      });
    } catch (error) {
      console.error("Error fetching vendor list:", error);
      res.status(500).json({ error: "Kunne ikke hente leverand\xF8r-liste" });
    }
  });
  app2.post("/api/admin/preview/couple/impersonate", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
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
      let coupleData;
      try {
        console.log("[Impersonate DEBUG] Executing select query");
        coupleData = await db.select({
          id: coupleProfiles.id,
          name: coupleProfiles.displayName,
          email: coupleProfiles.email
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
      const couple = coupleData.find((c) => c.id === userId);
      if (!couple) {
        console.warn("[Impersonate] Couple not found for ID:", userId);
        return res.status(404).json({ error: "Brudepar ikke funnet" });
      }
      const sessionToken = generateSessionToken();
      COUPLE_SESSIONS.set(sessionToken, {
        coupleId: userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3)
      });
      console.log("[Impersonate] Session created for couple:", userId);
      res.json({
        sessionToken,
        coupleId: userId,
        coupleData: couple
      });
    } catch (error) {
      console.error("[Impersonate] Error:", error instanceof Error ? error.message : String(error));
      console.error("[Impersonate] Full error:", error);
      res.status(500).json({ error: "Kunne ikke logge inn som brudepar" });
    }
  });
  app2.post("/api/admin/preview/vendor/impersonate", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
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
      let vendorData;
      try {
        vendorData = await db.select({
          id: vendors.id,
          name: vendors.businessName,
          email: vendors.email,
          categoryId: vendors.categoryId
        }).from(vendors).where(eq3(vendors.status, "approved")).limit(50);
      } catch (dbError) {
        console.error("[Impersonate Vendor] Database query error:", dbError);
        if (dbError instanceof Error) {
          console.error("[Impersonate Vendor] Error message:", dbError.message);
          console.error("[Impersonate Vendor] Error stack:", dbError.stack);
        }
        return res.status(503).json({ error: "Databasefeil ved oppslag" });
      }
      console.log("[Impersonate Vendor] Query result:", vendorData?.length ? "Found" : "Not found");
      const vendor = vendorData.find((v) => v.id === userId);
      if (!vendor) {
        console.warn("[Impersonate Vendor] Vendor not found for ID:", userId);
        return res.status(404).json({ error: "Leverand\xF8r ikke funnet" });
      }
      const sessionToken = generateSessionToken();
      VENDOR_SESSIONS.set(sessionToken, {
        vendorId: userId,
        createdAt: /* @__PURE__ */ new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3)
      });
      console.log("[Impersonate Vendor] Session created for vendor:", userId);
      res.json({
        sessionToken,
        vendorId: userId,
        vendorData: vendor
      });
    } catch (error) {
      console.error("[Impersonate Vendor] Error:", error instanceof Error ? error.message : String(error));
      console.error("[Impersonate Vendor] Full error:", error);
      res.status(500).json({ error: "Kunne ikke logge inn som leverand\xF8r" });
    }
  });
  app2.post("/api/admin/jobs/expire-offers", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const expiredOffers = await db.select().from(vendorOffers).where(and3(
        eq3(vendorOffers.status, "pending"),
        sql4`${vendorOffers.validUntil} < NOW()`
      ));
      if (expiredOffers.length === 0) {
        return res.json({ message: "Ingen utl\xF8pte tilbud", updated: 0 });
      }
      await db.update(vendorOffers).set({ status: "expired", updatedAt: /* @__PURE__ */ new Date() }).where(and3(
        eq3(vendorOffers.status, "pending"),
        sql4`${vendorOffers.validUntil} < NOW()`
      ));
      for (const offer of expiredOffers) {
        const [vendor] = await db.select({ businessName: vendors.businessName }).from(vendors).where(eq3(vendors.id, offer.vendorId));
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
    if (!await checkAdminAuth(req, res)) return;
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
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { name, icon, sortOrder } = req.body;
      await db.update(inspirationCategories).set({ name, icon, sortOrder }).where(eq3(inspirationCategories.id, id));
      res.json({ message: "Kategori oppdatert" });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategori" });
    }
  });
  app2.delete("/api/admin/inspiration-categories/:id", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.delete(inspirationCategories).where(eq3(inspirationCategories.id, id));
      res.json({ message: "Kategori slettet" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Kunne ikke slette kategori" });
    }
  });
  app2.post("/api/admin/vendor-categories", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
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
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      const { name, icon, description } = req.body;
      await db.update(vendorCategories).set({ name, icon, description }).where(eq3(vendorCategories.id, id));
      res.json({ message: "Kategori oppdatert" });
    } catch (error) {
      console.error("Error updating vendor category:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategori" });
    }
  });
  app2.delete("/api/admin/vendor-categories/:id", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.delete(vendorCategories).where(eq3(vendorCategories.id, id));
      res.json({ message: "Kategori slettet" });
    } catch (error) {
      console.error("Error deleting vendor category:", error);
      res.status(500).json({ error: "Kunne ikke slette kategori" });
    }
  });
  app2.get("/api/admin/couples", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const couples = await db.select().from(coupleProfiles).orderBy(desc2(coupleProfiles.createdAt));
      res.json(couples);
    } catch (error) {
      console.error("Error fetching couples:", error);
      res.status(500).json({ error: "Kunne ikke hente par" });
    }
  });
  app2.delete("/api/admin/couples/:id", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.delete(coupleSessions).where(eq3(coupleSessions.coupleId, id));
      await db.delete(messages).where(sql4`conversation_id IN (SELECT id FROM conversations WHERE couple_id = ${id})`);
      await db.delete(conversations).where(eq3(conversations.coupleId, id));
      await db.delete(coupleProfiles).where(eq3(coupleProfiles.id, id));
      res.json({ message: "Par slettet" });
    } catch (error) {
      console.error("Error deleting couple:", error);
      res.status(500).json({ error: "Kunne ikke slette par" });
    }
  });
  app2.put("/api/admin/vendors/:id", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
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
      }).where(eq3(vendors.id, id));
      res.json({ message: "Leverand\xF8r oppdatert" });
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere leverand\xF8r" });
    }
  });
  app2.delete("/api/admin/vendors/:id", async (req, res) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { id } = req.params;
      await db.delete(vendorFeatures).where(eq3(vendorFeatures.vendorId, id));
      await db.delete(vendorInspirationCategories).where(eq3(vendorInspirationCategories.vendorId, id));
      await db.delete(deliveryItems).where(sql4`delivery_id IN (SELECT id FROM deliveries WHERE vendor_id = ${id})`);
      await db.delete(deliveries).where(eq3(deliveries.vendorId, id));
      await db.delete(inspirationMedia).where(sql4`inspiration_id IN (SELECT id FROM inspirations WHERE vendor_id = ${id})`);
      await db.delete(inspirations).where(eq3(inspirations.vendorId, id));
      await db.delete(messages).where(sql4`conversation_id IN (SELECT id FROM conversations WHERE vendor_id = ${id})`);
      await db.delete(conversations).where(eq3(conversations.vendorId, id));
      await db.delete(vendorOfferItems).where(sql4`offer_id IN (SELECT id FROM vendor_offers WHERE vendor_id = ${id})`);
      await db.delete(vendorOffers).where(eq3(vendorOffers.vendorId, id));
      await db.delete(vendorProducts).where(eq3(vendorProducts.vendorId, id));
      await db.delete(vendors).where(eq3(vendors.id, id));
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
      const invitations = await db.select().from(coordinatorInvitations).where(eq3(coordinatorInvitations.coupleId, coupleId)).orderBy(desc2(coordinatorInvitations.createdAt));
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
      const accessToken = crypto3.randomBytes(32).toString("hex");
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
      }).where(and3(
        eq3(coordinatorInvitations.id, id),
        eq3(coordinatorInvitations.coupleId, coupleId)
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
      await db.delete(coordinatorInvitations).where(and3(
        eq3(coordinatorInvitations.id, id),
        eq3(coordinatorInvitations.coupleId, coupleId)
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
      const invitations = await db.select().from(guestInvitations).where(eq3(guestInvitations.coupleId, coupleId)).orderBy(desc2(guestInvitations.createdAt));
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
      const inviteToken = crypto3.randomBytes(24).toString("hex");
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
      }).where(and3(eq3(guestInvitations.id, id), eq3(guestInvitations.coupleId, coupleId))).returning();
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
      await db.delete(guestInvitations).where(and3(eq3(guestInvitations.id, id), eq3(guestInvitations.coupleId, coupleId)));
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
      }).from(guestInvitations).leftJoin(coupleProfiles, eq3(guestInvitations.coupleId, coupleProfiles.id)).where(eq3(guestInvitations.inviteToken, token));
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
      const [existing] = await db.select().from(guestInvitations).where(eq3(guestInvitations.inviteToken, token));
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
      }).where(eq3(guestInvitations.id, existing.id)).returning();
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
      const [invitation] = await db.select().from(coordinatorInvitations).where(and3(
        eq3(coordinatorInvitations.accessToken, token),
        eq3(coordinatorInvitations.status, "active")
      ));
      if (!invitation) {
        return res.status(404).json({ error: "Ugyldig eller utl\xF8pt tilgang" });
      }
      if (invitation.expiresAt && new Date(invitation.expiresAt) < /* @__PURE__ */ new Date()) {
        await db.update(coordinatorInvitations).set({ status: "expired" }).where(eq3(coordinatorInvitations.id, invitation.id));
        return res.status(403).json({ error: "Tilgangen har utl\xF8pt" });
      }
      await db.update(coordinatorInvitations).set({ lastAccessedAt: /* @__PURE__ */ new Date() }).where(eq3(coordinatorInvitations.id, invitation.id));
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
        weddingDate: coupleProfiles.weddingDate
      }).from(coupleProfiles).where(eq3(coupleProfiles.id, invitation.coupleId));
      let speechList = [];
      if (invitation.canViewSpeeches) {
        speechList = await db.select().from(speeches).where(eq3(speeches.coupleId, invitation.coupleId)).orderBy(speeches.sortOrder);
      }
      let scheduleList = [];
      if (invitation.canViewSchedule) {
        scheduleList = await db.select().from(scheduleEvents).where(eq3(scheduleEvents.coupleId, invitation.coupleId)).orderBy(scheduleEvents.time);
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
      const [invitation] = await db.select().from(coordinatorInvitations).where(and3(
        eq3(coordinatorInvitations.accessCode, code),
        eq3(coordinatorInvitations.status, "active")
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
      const events = await db.select().from(scheduleEvents).where(eq3(scheduleEvents.coupleId, coupleId)).orderBy(scheduleEvents.time);
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
      }).from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.coupleId, coupleId),
        eq3(coupleVendorContracts.status, "active")
      ));
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName
      }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
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
      const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
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
      }).where(and3(
        eq3(scheduleEvents.id, id),
        eq3(scheduleEvents.coupleId, coupleId)
      )).returning();
      if (!updated) {
        return res.status(404).json({ error: "Hendelse ikke funnet" });
      }
      const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
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
      const [event] = await db.select().from(scheduleEvents).where(and3(
        eq3(scheduleEvents.id, id),
        eq3(scheduleEvents.coupleId, coupleId)
      ));
      await db.delete(scheduleEvents).where(and3(
        eq3(scheduleEvents.id, id),
        eq3(scheduleEvents.coupleId, coupleId)
      ));
      if (event) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
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
    const [invite] = await db.select().from(coordinatorInvitations).where(and3(eq3(coordinatorInvitations.accessToken, token), eq3(coordinatorInvitations.status, "active")));
    if (!invite) {
      res.status(401).json({ error: "Ugyldig eller inaktiv tilgang" });
      return null;
    }
    await db.update(coordinatorInvitations).set({ lastAccessedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coordinatorInvitations.id, invite.id));
    return invite.coupleId;
  }
  app2.get("/api/coordinator/schedule-events", async (req, res) => {
    const coupleId = await checkCoordinatorAuth(req, res);
    if (!coupleId) return;
    try {
      const events = await db.select({ id: scheduleEvents.id, time: scheduleEvents.time, title: scheduleEvents.title, icon: scheduleEvents.icon }).from(scheduleEvents).where(eq3(scheduleEvents.coupleId, coupleId)).orderBy(scheduleEvents.time);
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
      const [couple] = await db.select({ id: coupleProfiles.id, displayName: coupleProfiles.displayName, weddingDate: coupleProfiles.weddingDate }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
      if (!couple) return res.status(404).json({ error: "Profil ikke funnet" });
      res.json(couple);
    } catch (error) {
      console.error("Error fetching coordinator couple profile:", error);
      res.status(500).json({ error: "Kunne ikke hente profil" });
    }
  });
  app2.get("/api/coordinator/seating", async (req, res) => {
    const coupleId = await checkCoordinatorAuth(req, res);
    if (!coupleId) return;
    try {
      const key = `couple_venue_seating_${coupleId}`;
      const [setting] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      const seating = setting?.value ? JSON.parse(setting.value) : { tables: [] };
      res.json(seating);
    } catch (error) {
      console.error("Error fetching coordinator seating:", error);
      res.status(500).json({ error: "Kunne ikke hente bordplan" });
    }
  });
  app2.get("/api/couple/guests", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const guests = await db.select().from(weddingGuests).where(eq3(weddingGuests.coupleId, coupleId)).orderBy(weddingGuests.createdAt);
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
        and3(
          eq3(weddingGuests.id, id),
          eq3(weddingGuests.coupleId, coupleId)
        )
      );
      if (!guest) {
        return res.status(404).json({ error: "Gjest ikke funnet" });
      }
      const [updated] = await db.update(weddingGuests).set({ ...parsed, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(weddingGuests.id, id)).returning();
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
        and3(
          eq3(weddingGuests.id, id),
          eq3(weddingGuests.coupleId, coupleId)
        )
      );
      if (!guest) {
        return res.status(404).json({ error: "Gjest ikke funnet" });
      }
      await db.delete(weddingGuests).where(eq3(weddingGuests.id, id));
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
      const tables = await db.select().from(weddingTables).where(eq3(weddingTables.coupleId, coupleId)).orderBy(weddingTables.sortOrder);
      const assignments = await db.select().from(tableGuestAssignments).where(eq3(tableGuestAssignments.coupleId, coupleId));
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
      const [updated] = await db.update(weddingTables).set(updates).where(and3(
        eq3(weddingTables.id, id),
        eq3(weddingTables.coupleId, coupleId)
      )).returning();
      if (!updated) {
        return res.status(404).json({ error: "Bord ikke funnet" });
      }
      const contracts = await db.select({
        vendorId: coupleVendorContracts.vendorId,
        notifyOnTableChanges: coupleVendorContracts.notifyOnTableChanges
      }).from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.coupleId, coupleId),
        eq3(coupleVendorContracts.status, "active"),
        eq3(coupleVendorContracts.canViewTableSeating, true)
      ));
      const [couple] = await db.select({ displayName: coupleProfiles.displayName }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
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
      await db.delete(tableGuestAssignments).where(and3(
        eq3(tableGuestAssignments.tableId, id),
        eq3(tableGuestAssignments.coupleId, coupleId)
      ));
      await db.delete(weddingTables).where(and3(
        eq3(weddingTables.id, id),
        eq3(weddingTables.coupleId, coupleId)
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
      await db.delete(tableGuestAssignments).where(and3(
        eq3(tableGuestAssignments.coupleId, coupleId),
        eq3(tableGuestAssignments.guestId, guestId)
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
      await db.delete(tableGuestAssignments).where(and3(
        eq3(tableGuestAssignments.coupleId, coupleId),
        eq3(tableGuestAssignments.tableId, tableId),
        eq3(tableGuestAssignments.guestId, guestId)
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
      const [contract] = await db.select().from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.vendorId, vendorId),
        eq3(coupleVendorContracts.coupleId, coupleId),
        eq3(coupleVendorContracts.status, "active"),
        eq3(coupleVendorContracts.canViewTableSeating, true)
      ));
      if (!contract) {
        return res.status(403).json({ error: "Ingen tilgang til bordplassering" });
      }
      const tables = await db.select().from(weddingTables).where(eq3(weddingTables.coupleId, coupleId)).orderBy(weddingTables.sortOrder);
      const assignments = await db.select().from(tableGuestAssignments).where(eq3(tableGuestAssignments.coupleId, coupleId));
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
    const [invitation] = await db.select().from(coordinatorInvitations).where(and3(
      eq3(coordinatorInvitations.accessToken, token),
      eq3(coordinatorInvitations.status, "active")
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
      }).from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.coupleId, coupleId),
        eq3(coupleVendorContracts.status, "active")
      ));
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName
      }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
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
      const [previousEvent] = await db.select().from(scheduleEvents).where(and3(
        eq3(scheduleEvents.id, id),
        eq3(scheduleEvents.coupleId, invitation.coupleId)
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
      }).where(and3(
        eq3(scheduleEvents.id, id),
        eq3(scheduleEvents.coupleId, invitation.coupleId)
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
      const [event] = await db.select().from(scheduleEvents).where(and3(
        eq3(scheduleEvents.id, id),
        eq3(scheduleEvents.coupleId, invitation.coupleId)
      ));
      if (!event) {
        return res.status(404).json({ error: "Hendelse ikke funnet" });
      }
      await db.delete(scheduleEvents).where(and3(
        eq3(scheduleEvents.id, id),
        eq3(scheduleEvents.coupleId, invitation.coupleId)
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
      const [previousSpeech] = await db.select().from(speeches).where(and3(
        eq3(speeches.id, id),
        eq3(speeches.coupleId, invitation.coupleId)
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
      }).where(and3(
        eq3(speeches.id, id),
        eq3(speeches.coupleId, invitation.coupleId)
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
      const [speech] = await db.select().from(speeches).where(and3(
        eq3(speeches.id, id),
        eq3(speeches.coupleId, invitation.coupleId)
      ));
      if (!speech) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }
      await db.delete(speeches).where(and3(
        eq3(speeches.id, id),
        eq3(speeches.coupleId, invitation.coupleId)
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
      }).from(coupleVendorContracts).leftJoin(vendors, eq3(coupleVendorContracts.vendorId, vendors.id)).leftJoin(vendorCategories, eq3(vendors.categoryId, vendorCategories.id)).where(eq3(coupleVendorContracts.coupleId, coupleId)).orderBy(desc2(coupleVendorContracts.createdAt));
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
      const [existing] = await db.select().from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.coupleId, coupleId),
        eq3(coupleVendorContracts.vendorId, vendorId),
        eq3(coupleVendorContracts.status, "active")
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
      }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
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
      const [currentContract] = await db.select().from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.id, id),
        eq3(coupleVendorContracts.coupleId, coupleId)
      ));
      if (!currentContract) {
        return res.status(404).json({ error: "Avtale ikke funnet" });
      }
      if (status === "cancelled" && currentContract.status !== "cancelled") {
        try {
          await db.transaction(async (tx) => {
            if (currentContract.offerId) {
              const offerItems = await tx.select().from(vendorOfferItems).where(eq3(vendorOfferItems.offerId, currentContract.offerId));
              for (const item of offerItems) {
                if (!item.productId) continue;
                const [product] = await tx.select().from(vendorProducts).where(eq3(vendorProducts.id, item.productId));
                if (product?.trackInventory && product.availableQuantity !== null) {
                  const restoredQuantity = product.availableQuantity + (item.quantity || 0);
                  await tx.update(vendorProducts).set({
                    availableQuantity: restoredQuantity,
                    updatedAt: /* @__PURE__ */ new Date()
                  }).where(eq3(vendorProducts.id, item.productId));
                }
              }
            }
            await tx.update(coupleVendorContracts).set({
              notifyOnScheduleChanges,
              notifyOnSpeechChanges,
              canViewSchedule,
              canViewSpeeches,
              status,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(and3(
              eq3(coupleVendorContracts.id, id),
              eq3(coupleVendorContracts.coupleId, coupleId)
            ));
          });
          const [updated2] = await db.select().from(coupleVendorContracts).where(eq3(coupleVendorContracts.id, id));
          return res.json(updated2);
        } catch (txError) {
          console.error("Transaction error cancelling contract:", txError);
          return res.status(500).json({ error: "Kunne ikke kansellere avtale" });
        }
      }
      const [updated] = await db.update(coupleVendorContracts).set({
        notifyOnScheduleChanges,
        notifyOnSpeechChanges,
        canViewSchedule,
        canViewSpeeches,
        status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and3(
        eq3(coupleVendorContracts.id, id),
        eq3(coupleVendorContracts.coupleId, coupleId)
      )).returning();
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
      }).where(and3(
        eq3(coupleVendorContracts.id, id),
        eq3(coupleVendorContracts.coupleId, coupleId)
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
      const vendorNotifications = await db.select().from(notifications).where(and3(
        eq3(notifications.recipientType, "vendor"),
        eq3(notifications.recipientId, vendorId)
      )).orderBy(desc2(notifications.createdAt)).limit(50);
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
      await db.update(notifications).set({ readAt: /* @__PURE__ */ new Date() }).where(and3(
        eq3(notifications.id, id),
        eq3(notifications.recipientId, vendorId)
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
      const coupleNotifications = await db.select().from(notifications).where(and3(
        eq3(notifications.recipientType, "couple"),
        eq3(notifications.recipientId, coupleId)
      )).orderBy(desc2(notifications.createdAt)).limit(50);
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
      const [result] = await db.select({ count: sql4`count(*)::int` }).from(notifications).where(and3(
        eq3(notifications.recipientType, "vendor"),
        eq3(notifications.recipientId, vendorId),
        sql4`${notifications.readAt} IS NULL`
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
      const [contract] = await db.select().from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.coupleId, coupleId),
        eq3(coupleVendorContracts.vendorId, vendorId),
        eq3(coupleVendorContracts.status, "active"),
        eq3(coupleVendorContracts.canViewSchedule, true)
      ));
      if (!contract) {
        return res.status(403).json({ error: "Ingen tilgang til dette programmet" });
      }
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
        weddingDate: coupleProfiles.weddingDate
      }).from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
      const schedule = await db.select().from(scheduleEvents).where(eq3(scheduleEvents.coupleId, coupleId)).orderBy(scheduleEvents.time);
      let speechList = [];
      if (contract.canViewSpeeches) {
        speechList = await db.select().from(speeches).where(eq3(speeches.coupleId, coupleId)).orderBy(speeches.sortOrder);
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
  app2.post("/api/vendor/schedule-suggestions", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    try {
      const { coupleId, type, eventId, suggestedTime, suggestedTitle, message } = req.body;
      if (!coupleId || !message) {
        return res.status(400).json({ error: "Mangler p\xE5krevde felter" });
      }
      const [contract] = await db.select().from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.coupleId, coupleId),
        eq3(coupleVendorContracts.vendorId, vendorId),
        eq3(coupleVendorContracts.status, "active")
      ));
      if (!contract) {
        return res.status(403).json({ error: "Ingen aktiv avtale med dette brudeparet" });
      }
      const [vendor] = await db.select({ businessName: vendors.businessName }).from(vendors).where(eq3(vendors.id, vendorId));
      const payload = {
        type,
        eventId,
        suggestedTime,
        suggestedTitle,
        message,
        vendorId
      };
      await db.insert(notifications).values({
        recipientType: "couple",
        recipientId: coupleId,
        type: "schedule_suggestion",
        title: "Forslag til programendring",
        body: `${vendor?.businessName || "En leverand\xF8r"} foresl\xE5r en endring: ${message.substring(0, 100)}${message.length > 100 ? "..." : ""}`,
        actorType: "vendor",
        actorId: vendorId,
        payload: JSON.stringify(payload)
      });
      await db.insert(activityLogs).values({
        coupleId,
        actorType: "vendor",
        actorId: vendorId,
        actorName: vendor?.businessName || "Leverand\xF8r",
        action: "schedule_suggestion",
        entityType: "schedule_suggestion",
        entityId: vendorId,
        newValue: JSON.stringify({ message: message.substring(0, 100) })
      });
      res.json({ success: true, message: "Forslag sendt til brudeparet" });
    } catch (error) {
      console.error("Error sending schedule suggestion:", error);
      res.status(500).json({ error: "Kunne ikke sende forslag" });
    }
  });
  app2.get("/api/vendor/couple-contracts", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
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
        weddingDate: coupleProfiles.weddingDate
      }).from(coupleVendorContracts).innerJoin(coupleProfiles, eq3(coupleVendorContracts.coupleId, coupleProfiles.id)).where(and3(
        eq3(coupleVendorContracts.vendorId, vendorId),
        eq3(coupleVendorContracts.status, "active")
      )).orderBy(desc2(coupleVendorContracts.createdAt));
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching vendor couple contracts:", error);
      res.status(500).json({ error: "Kunne ikke hente avtaler" });
    }
  });
  app2.get("/api/couple/activity-log", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const logs = await db.select().from(activityLogs).where(eq3(activityLogs.coupleId, coupleId)).orderBy(desc2(activityLogs.createdAt)).limit(50);
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
      }).from(coupleVendorContracts).innerJoin(vendors, eq3(coupleVendorContracts.vendorId, vendors.id)).where(and3(
        eq3(coupleVendorContracts.coupleId, coupleId),
        eq3(coupleVendorContracts.status, "completed")
      ));
      const existingReviews = await db.select({ contractId: vendorReviews.contractId }).from(vendorReviews).where(eq3(vendorReviews.coupleId, coupleId));
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
      const [contract] = await db.select().from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.id, contractId),
        eq3(coupleVendorContracts.coupleId, coupleId),
        eq3(coupleVendorContracts.status, "completed")
      ));
      if (!contract) {
        return res.status(404).json({ error: "Fant ikke fullf\xF8rt avtale" });
      }
      const [existing] = await db.select().from(vendorReviews).where(eq3(vendorReviews.contractId, contractId));
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
      const [existing] = await db.select().from(vendorReviews).where(and3(
        eq3(vendorReviews.id, id),
        eq3(vendorReviews.coupleId, coupleId)
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
      }).where(eq3(vendorReviews.id, id)).returning();
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
      }).from(vendorReviews).innerJoin(vendors, eq3(vendorReviews.vendorId, vendors.id)).where(eq3(vendorReviews.coupleId, coupleId)).orderBy(desc2(vendorReviews.createdAt));
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
      }).from(vendorReviews).innerJoin(coupleProfiles, eq3(vendorReviews.coupleId, coupleProfiles.id)).where(and3(
        eq3(vendorReviews.vendorId, vendorId),
        eq3(vendorReviews.isApproved, true)
      )).orderBy(desc2(vendorReviews.createdAt));
      const [vendor] = await db.select({ googleReviewUrl: vendors.googleReviewUrl }).from(vendors).where(eq3(vendors.id, vendorId));
      const [stats] = await db.select({
        count: sql4`count(*)::int`,
        average: sql4`round(avg(${vendorReviews.rating})::numeric, 1)`
      }).from(vendorReviews).where(and3(
        eq3(vendorReviews.vendorId, vendorId),
        eq3(vendorReviews.isApproved, true)
      ));
      const responses = await db.select().from(vendorReviewResponses).innerJoin(vendorReviews, eq3(vendorReviewResponses.reviewId, vendorReviews.id)).where(eq3(vendorReviews.vendorId, vendorId));
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
  app2.get("/api/vendors/:vendorId/products", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const products = await db.select().from(vendorProducts).where(eq3(vendorProducts.vendorId, vendorId)).orderBy(vendorProducts.createdAt);
      const productsWithMetadata = products.map((p) => ({
        ...p,
        metadata: p.metadata ? JSON.parse(p.metadata) : null
      }));
      res.json(productsWithMetadata);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({ error: "Kunne ikke hente produkter" });
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
      }).from(vendorReviews).innerJoin(coupleProfiles, eq3(vendorReviews.coupleId, coupleProfiles.id)).where(eq3(vendorReviews.vendorId, vendorId)).orderBy(desc2(vendorReviews.createdAt));
      const responses = await db.select().from(vendorReviewResponses).where(eq3(vendorReviewResponses.vendorId, vendorId));
      const responseMap = new Map(responses.map((r) => [r.reviewId, r]));
      const reviewsWithResponses = reviews.map((r) => ({
        ...r,
        coupleName: r.isAnonymous ? "Anonym" : r.coupleName,
        response: responseMap.get(r.id) || null
      }));
      const [stats] = await db.select({
        total: sql4`count(*)::int`,
        approved: sql4`count(*) filter (where ${vendorReviews.isApproved})::int`,
        average: sql4`round(avg(${vendorReviews.rating})::numeric, 1)`
      }).from(vendorReviews).where(eq3(vendorReviews.vendorId, vendorId));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { reviewId } = req.params;
      const { body } = req.body;
      if (!body || body.trim().length === 0) {
        return res.status(400).json({ error: "Svar kan ikke v\xE6re tomt" });
      }
      const [review] = await db.select().from(vendorReviews).where(and3(
        eq3(vendorReviews.id, reviewId),
        eq3(vendorReviews.vendorId, vendorId)
      ));
      if (!review) {
        return res.status(404).json({ error: "Fant ikke anmeldelse" });
      }
      const [existing] = await db.select().from(vendorReviewResponses).where(eq3(vendorReviewResponses.reviewId, reviewId));
      if (existing) {
        const [updated] = await db.update(vendorReviewResponses).set({ body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(vendorReviewResponses.reviewId, reviewId)).returning();
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
      }).from(coupleVendorContracts).innerJoin(coupleProfiles, eq3(coupleVendorContracts.coupleId, coupleProfiles.id)).where(eq3(coupleVendorContracts.vendorId, vendorId)).orderBy(desc2(coupleVendorContracts.createdAt));
      const contractIds = contracts.map((c) => c.id);
      const reviews = contractIds.length > 0 ? await db.select({ contractId: vendorReviews.contractId }).from(vendorReviews).where(inArray2(vendorReviews.contractId, contractIds)) : [];
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { contractId } = req.params;
      const [contract] = await db.select().from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.id, contractId),
        eq3(coupleVendorContracts.vendorId, vendorId),
        eq3(coupleVendorContracts.status, "completed")
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
      const [existingReview] = await db.select().from(vendorReviews).where(eq3(vendorReviews.contractId, contractId));
      if (existingReview) {
        return res.status(400).json({ error: "Brudeparet har allerede gitt anmeldelse" });
      }
      const [vendor] = await db.select({ businessName: vendors.businessName }).from(vendors).where(eq3(vendors.id, vendorId));
      await db.insert(notifications).values({
        recipientType: "couple",
        recipientId: contract.coupleId,
        type: "review_reminder",
        title: "Gi en anmeldelse",
        body: `${vendor?.businessName} \xF8nsker gjerne din tilbakemelding p\xE5 tjenesten`,
        payload: JSON.stringify({ contractId, vendorId })
      });
      await db.update(coupleVendorContracts).set({ reviewReminderSentAt: /* @__PURE__ */ new Date() }).where(eq3(coupleVendorContracts.id, contractId));
      res.json({ success: true, message: "P\xE5minnelse sendt" });
    } catch (error) {
      console.error("Error sending review reminder:", error);
      res.status(500).json({ error: "Kunne ikke sende p\xE5minnelse" });
    }
  });
  app2.patch("/api/vendor/google-review-url", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { googleReviewUrl } = req.body;
      if (googleReviewUrl && !googleReviewUrl.includes("google.com")) {
        return res.status(400).json({ error: "Ugyldig Google-lenke" });
      }
      await db.update(vendors).set({ googleReviewUrl: googleReviewUrl || null, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(vendors.id, vendorId));
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
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
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
      const feedback = await db.select().from(appFeedback).orderBy(desc2(appFeedback.createdAt));
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
      const [updated] = await db.update(appFeedback).set({ status, adminNotes, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(appFeedback.id, id)).returning();
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
      }).where(eq3(vendorReviews.id, id)).returning();
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
      }).from(vendorReviews).innerJoin(coupleProfiles, eq3(vendorReviews.coupleId, coupleProfiles.id)).innerJoin(vendors, eq3(vendorReviews.vendorId, vendors.id)).where(eq3(vendorReviews.isApproved, false)).orderBy(vendorReviews.createdAt);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ error: "Kunne ikke hente ventende anmeldelser" });
    }
  });
  app2.patch("/api/vendor/contracts/:id/complete", async (req, res) => {
    const vendorId = await checkVendorAuth2(req, res);
    if (!vendorId) return;
    if (!await checkVendorSubscriptionAccess(vendorId, res)) return;
    try {
      const { id } = req.params;
      const [contract] = await db.select().from(coupleVendorContracts).where(and3(
        eq3(coupleVendorContracts.id, id),
        eq3(coupleVendorContracts.vendorId, vendorId)
      ));
      if (!contract) {
        return res.status(404).json({ error: "Fant ikke avtale" });
      }
      const [updated] = await db.update(coupleVendorContracts).set({
        status: "completed",
        completedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(coupleVendorContracts.id, id)).returning();
      const [vendor] = await db.select({ businessName: vendors.businessName }).from(vendors).where(eq3(vendors.id, vendorId));
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
      }).from(checklistTasks).innerJoin(coupleProfiles, eq3(checklistTasks.coupleId, coupleProfiles.id)).orderBy(coupleProfiles.displayName, checklistTasks.sortOrder);
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
      const tasks = await db.select().from(checklistTasks).where(eq3(checklistTasks.coupleId, coupleId)).orderBy(checklistTasks.sortOrder, checklistTasks.monthsBefore);
      const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
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
      const [updated] = await db.update(checklistTasks).set(updateData).where(eq3(checklistTasks.id, id)).returning();
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
      await db.delete(checklistTasks).where(eq3(checklistTasks.id, id));
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
      const tasks = await db.select().from(checklistTasks).where(eq3(checklistTasks.coupleId, coupleId)).orderBy(checklistTasks.sortOrder, checklistTasks.monthsBefore);
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
      const [existing] = await db.select().from(checklistTasks).where(and3(
        eq3(checklistTasks.id, id),
        eq3(checklistTasks.coupleId, coupleId)
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
        const [couple] = await db.select().from(coupleProfiles).where(eq3(coupleProfiles.id, coupleId));
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
      const [updated] = await db.update(checklistTasks).set(updateData).where(eq3(checklistTasks.id, id)).returning();
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
      const [existing] = await db.select().from(checklistTasks).where(and3(
        eq3(checklistTasks.id, id),
        eq3(checklistTasks.coupleId, coupleId)
      ));
      if (!existing) {
        return res.status(404).json({ error: "Fant ikke oppgave" });
      }
      if (existing.isDefault) {
        return res.status(400).json({ error: "Kan ikke slette standardoppgaver" });
      }
      await db.delete(checklistTasks).where(eq3(checklistTasks.id, id));
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
      const existing = await db.select().from(checklistTasks).where(eq3(checklistTasks.coupleId, coupleId));
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
  app2.get("/api/couple/budget/settings", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [settings] = await db.select().from(coupleBudgetSettings).where(eq3(coupleBudgetSettings.coupleId, coupleId));
      res.json(settings || { totalBudget: 0, currency: "NOK" });
    } catch (error) {
      console.error("Error fetching budget settings:", error);
      res.status(500).json({ error: "Kunne ikke hente budsjettinnstillinger" });
    }
  });
  app2.put("/api/couple/budget/settings", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { totalBudget, currency } = req.body;
      const [existing] = await db.select().from(coupleBudgetSettings).where(eq3(coupleBudgetSettings.coupleId, coupleId));
      if (existing) {
        const [updated] = await db.update(coupleBudgetSettings).set({ totalBudget, currency, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleBudgetSettings.coupleId, coupleId)).returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(coupleBudgetSettings).values({
          coupleId,
          totalBudget,
          currency: currency || "NOK"
        }).returning();
        res.json(created);
      }
    } catch (error) {
      console.error("Error updating budget settings:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere budsjettinnstillinger" });
    }
  });
  app2.get("/api/couple/budget/items", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const items = await db.select().from(coupleBudgetItems).where(eq3(coupleBudgetItems.coupleId, coupleId)).orderBy(coupleBudgetItems.sortOrder, coupleBudgetItems.createdAt);
      res.json(items);
    } catch (error) {
      console.error("Error fetching budget items:", error);
      res.status(500).json({ error: "Kunne ikke hente budsjettlinjer" });
    }
  });
  app2.post("/api/couple/budget/items", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const parsed = createBudgetItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }
      const [item] = await db.insert(coupleBudgetItems).values({
        coupleId,
        ...parsed.data
      }).returning();
      res.json(item);
    } catch (error) {
      console.error("Error creating budget item:", error);
      res.status(500).json({ error: "Kunne ikke opprette budsjettlinje" });
    }
  });
  app2.patch("/api/couple/budget/items/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { category, label, estimatedCost, actualCost, isPaid, notes, sortOrder } = req.body;
      const [existing] = await db.select().from(coupleBudgetItems).where(and3(eq3(coupleBudgetItems.id, id), eq3(coupleBudgetItems.coupleId, coupleId)));
      if (!existing) {
        return res.status(404).json({ error: "Fant ikke budsjettlinje" });
      }
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (category !== void 0) updateData.category = category;
      if (label !== void 0) updateData.label = label;
      if (estimatedCost !== void 0) updateData.estimatedCost = estimatedCost;
      if (actualCost !== void 0) updateData.actualCost = actualCost;
      if (isPaid !== void 0) updateData.isPaid = isPaid;
      if (notes !== void 0) updateData.notes = notes;
      if (sortOrder !== void 0) updateData.sortOrder = sortOrder;
      const [updated] = await db.update(coupleBudgetItems).set(updateData).where(eq3(coupleBudgetItems.id, id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating budget item:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere budsjettlinje" });
    }
  });
  app2.delete("/api/couple/budget/items/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleBudgetItems).where(and3(eq3(coupleBudgetItems.id, id), eq3(coupleBudgetItems.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting budget item:", error);
      res.status(500).json({ error: "Kunne ikke slette budsjettlinje" });
    }
  });
  app2.get("/api/couple/dress", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [appointments, favorites, timeline] = await Promise.all([
        db.select().from(coupleDressAppointments).where(eq3(coupleDressAppointments.coupleId, coupleId)).orderBy(coupleDressAppointments.date),
        db.select().from(coupleDressFavorites).where(eq3(coupleDressFavorites.coupleId, coupleId)).orderBy(coupleDressFavorites.createdAt),
        db.select().from(coupleDressTimeline).where(eq3(coupleDressTimeline.coupleId, coupleId))
      ]);
      res.json({
        appointments,
        favorites,
        timeline: timeline[0] || null
      });
    } catch (error) {
      console.error("Error fetching dress data:", error);
      res.status(500).json({ error: "Kunne ikke hente kjoledata" });
    }
  });
  app2.post("/api/couple/dress/appointments", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const parsed = createDressAppointmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }
      const [appointment] = await db.insert(coupleDressAppointments).values({
        coupleId,
        ...parsed.data
      }).returning();
      res.json(appointment);
    } catch (error) {
      console.error("Error creating dress appointment:", error);
      res.status(500).json({ error: "Kunne ikke opprette avtale" });
    }
  });
  app2.patch("/api/couple/dress/appointments/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { shopName, date: date2, time, notes, completed } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (shopName !== void 0) updateData.shopName = shopName;
      if (date2 !== void 0) updateData.date = date2;
      if (time !== void 0) updateData.time = time;
      if (notes !== void 0) updateData.notes = notes;
      if (completed !== void 0) updateData.completed = completed;
      const [updated] = await db.update(coupleDressAppointments).set(updateData).where(and3(eq3(coupleDressAppointments.id, id), eq3(coupleDressAppointments.coupleId, coupleId))).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating dress appointment:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere avtale" });
    }
  });
  app2.delete("/api/couple/dress/appointments/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleDressAppointments).where(and3(eq3(coupleDressAppointments.id, id), eq3(coupleDressAppointments.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dress appointment:", error);
      res.status(500).json({ error: "Kunne ikke slette avtale" });
    }
  });
  app2.post("/api/couple/dress/favorites", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const parsed = createDressFavoriteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }
      const [favorite] = await db.insert(coupleDressFavorites).values({
        coupleId,
        ...parsed.data
      }).returning();
      res.json(favorite);
    } catch (error) {
      console.error("Error creating dress favorite:", error);
      res.status(500).json({ error: "Kunne ikke lagre kjole" });
    }
  });
  app2.patch("/api/couple/dress/favorites/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { name, designer, shop, price, imageUrl, notes, isFavorite } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (name !== void 0) updateData.name = name;
      if (designer !== void 0) updateData.designer = designer;
      if (shop !== void 0) updateData.shop = shop;
      if (price !== void 0) updateData.price = price;
      if (imageUrl !== void 0) updateData.imageUrl = imageUrl;
      if (notes !== void 0) updateData.notes = notes;
      if (isFavorite !== void 0) updateData.isFavorite = isFavorite;
      const [updated] = await db.update(coupleDressFavorites).set(updateData).where(and3(eq3(coupleDressFavorites.id, id), eq3(coupleDressFavorites.coupleId, coupleId))).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating dress favorite:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kjole" });
    }
  });
  app2.delete("/api/couple/dress/favorites/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleDressFavorites).where(and3(eq3(coupleDressFavorites.id, id), eq3(coupleDressFavorites.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dress favorite:", error);
      res.status(500).json({ error: "Kunne ikke slette kjole" });
    }
  });
  app2.put("/api/couple/dress/timeline", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { ordered, orderedDate, firstFitting, firstFittingDate, alterations, alterationsDate, finalFitting, finalFittingDate, pickup, pickupDate, budget } = req.body;
      const [existing] = await db.select().from(coupleDressTimeline).where(eq3(coupleDressTimeline.coupleId, coupleId));
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
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (existing) {
        const [updated] = await db.update(coupleDressTimeline).set(timelineData).where(eq3(coupleDressTimeline.coupleId, coupleId)).returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(coupleDressTimeline).values({
          coupleId,
          ...timelineData
        }).returning();
        res.json(created);
      }
    } catch (error) {
      console.error("Error updating dress timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });
  app2.get("/api/couple/important-people", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const people = await db.select().from(coupleImportantPeople).where(eq3(coupleImportantPeople.coupleId, coupleId)).orderBy(coupleImportantPeople.sortOrder, coupleImportantPeople.createdAt);
      res.json(people);
    } catch (error) {
      console.error("Error fetching important people:", error);
      res.status(500).json({ error: "Kunne ikke hente viktige personer" });
    }
  });
  app2.post("/api/couple/important-people", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const parsed = createImportantPersonSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }
      const [person] = await db.insert(coupleImportantPeople).values({
        coupleId,
        ...parsed.data
      }).returning();
      res.json(person);
    } catch (error) {
      console.error("Error creating important person:", error);
      res.status(500).json({ error: "Kunne ikke legge til person" });
    }
  });
  app2.patch("/api/couple/important-people/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { name, role, phone, email, notes, sortOrder } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (name !== void 0) updateData.name = name;
      if (role !== void 0) updateData.role = role;
      if (phone !== void 0) updateData.phone = phone;
      if (email !== void 0) updateData.email = email;
      if (notes !== void 0) updateData.notes = notes;
      if (sortOrder !== void 0) updateData.sortOrder = sortOrder;
      const [updated] = await db.update(coupleImportantPeople).set(updateData).where(and3(eq3(coupleImportantPeople.id, id), eq3(coupleImportantPeople.coupleId, coupleId))).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating important person:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere person" });
    }
  });
  app2.delete("/api/couple/important-people/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleImportantPeople).where(and3(eq3(coupleImportantPeople.id, id), eq3(coupleImportantPeople.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting important person:", error);
      res.status(500).json({ error: "Kunne ikke slette person" });
    }
  });
  app2.get("/api/couple/photo-shots", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const shots = await db.select().from(couplePhotoShots).where(eq3(couplePhotoShots.coupleId, coupleId)).orderBy(couplePhotoShots.sortOrder, couplePhotoShots.createdAt);
      res.json(shots);
    } catch (error) {
      console.error("Error fetching photo shots:", error);
      res.status(500).json({ error: "Kunne ikke hente fotoliste" });
    }
  });
  app2.post("/api/couple/photo-shots", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const parsed = createPhotoShotSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }
      const [shot] = await db.insert(couplePhotoShots).values({
        coupleId,
        ...parsed.data
      }).returning();
      res.json(shot);
    } catch (error) {
      console.error("Error creating photo shot:", error);
      res.status(500).json({ error: "Kunne ikke legge til bilde" });
    }
  });
  app2.patch("/api/couple/photo-shots/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const { title, description, category, completed, sortOrder } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (title !== void 0) updateData.title = title;
      if (description !== void 0) updateData.description = description;
      if (category !== void 0) updateData.category = category;
      if (completed !== void 0) updateData.completed = completed;
      if (sortOrder !== void 0) updateData.sortOrder = sortOrder;
      const [updated] = await db.update(couplePhotoShots).set(updateData).where(and3(eq3(couplePhotoShots.id, id), eq3(couplePhotoShots.coupleId, coupleId))).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating photo shot:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere bilde" });
    }
  });
  app2.delete("/api/couple/photo-shots/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(couplePhotoShots).where(and3(eq3(couplePhotoShots.id, id), eq3(couplePhotoShots.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting photo shot:", error);
      res.status(500).json({ error: "Kunne ikke slette bilde" });
    }
  });
  app2.post("/api/couple/photo-shots/seed-defaults", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(couplePhotoShots).where(eq3(couplePhotoShots.coupleId, coupleId));
      if (existing.length > 0) {
        return res.status(400).json({ error: "Fotoliste finnes allerede" });
      }
      const DEFAULT_SHOTS = [
        { title: "Detaljer av brudekjolen", description: "N\xE6rbilder av kjole og sko", category: "details", sortOrder: 1 },
        { title: "Bruden og forlover", description: "F\xF8r seremonien", category: "portraits", sortOrder: 2 },
        { title: "Brudgommen gj\xF8r seg klar", description: "Med bestmennene", category: "portraits", sortOrder: 3 },
        { title: "Brudens ankomst", description: "Ved kirken/lokalet", category: "ceremony", sortOrder: 4 },
        { title: "Seremonien", description: "Utveksling av l\xF8fter og ringer", category: "ceremony", sortOrder: 5 },
        { title: "F\xF8rste kyss", description: "Det viktige \xF8yeblikket", category: "ceremony", sortOrder: 6 },
        { title: "Gruppebilde med familie", description: "Begge familier samlet", category: "group", sortOrder: 7 },
        { title: "Brudeparet alene", description: "Romantiske portretter", category: "portraits", sortOrder: 8 },
        { title: "Middagen starter", description: "F\xF8rste dans og taler", category: "reception", sortOrder: 9 },
        { title: "Kaken skj\xE6res", description: "Bryllupskaken", category: "reception", sortOrder: 10 }
      ];
      const shots = await db.insert(couplePhotoShots).values(
        DEFAULT_SHOTS.map((shot) => ({
          coupleId,
          ...shot
        }))
      ).returning();
      res.json(shots);
    } catch (error) {
      console.error("Error seeding photo shots:", error);
      res.status(500).json({ error: "Kunne ikke opprette standardfotoliste" });
    }
  });
  app2.get("/api/couple/hair-makeup", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [appointments, looks, timelineRows] = await Promise.all([
        db.select().from(coupleHairMakeupAppointments).where(eq3(coupleHairMakeupAppointments.coupleId, coupleId)).orderBy(coupleHairMakeupAppointments.date),
        db.select().from(coupleHairMakeupLooks).where(eq3(coupleHairMakeupLooks.coupleId, coupleId)),
        db.select().from(coupleHairMakeupTimeline).where(eq3(coupleHairMakeupTimeline.coupleId, coupleId))
      ]);
      const timeline = timelineRows[0] || {
        consultationBooked: false,
        trialBooked: false,
        lookSelected: false,
        weddingDayBooked: false,
        budget: 0
      };
      res.json({ appointments, looks, timeline });
    } catch (error) {
      console.error("Error fetching hair/makeup data:", error);
      res.status(500).json({ error: "Kunne ikke hente h\xE5r/makeup data" });
    }
  });
  app2.post("/api/couple/hair-makeup/appointments", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { stylistName, serviceType, appointmentType, date: date2, time, location, notes } = req.body;
      const [appointment] = await db.insert(coupleHairMakeupAppointments).values({
        coupleId,
        stylistName,
        serviceType,
        appointmentType,
        date: date2,
        time,
        location,
        notes
      }).returning();
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Kunne ikke opprette avtale" });
    }
  });
  app2.patch("/api/couple/hair-makeup/appointments/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [appointment] = await db.update(coupleHairMakeupAppointments).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleHairMakeupAppointments.id, id), eq3(coupleHairMakeupAppointments.coupleId, coupleId))).returning();
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere avtale" });
    }
  });
  app2.delete("/api/couple/hair-makeup/appointments/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleHairMakeupAppointments).where(and3(eq3(coupleHairMakeupAppointments.id, id), eq3(coupleHairMakeupAppointments.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: "Kunne ikke slette avtale" });
    }
  });
  app2.post("/api/couple/hair-makeup/looks", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { name, lookType, imageUrl, notes, isFavorite } = req.body;
      const [look] = await db.insert(coupleHairMakeupLooks).values({
        coupleId,
        name,
        lookType,
        imageUrl,
        notes,
        isFavorite
      }).returning();
      res.json(look);
    } catch (error) {
      console.error("Error creating look:", error);
      res.status(500).json({ error: "Kunne ikke opprette look" });
    }
  });
  app2.patch("/api/couple/hair-makeup/looks/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [look] = await db.update(coupleHairMakeupLooks).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleHairMakeupLooks.id, id), eq3(coupleHairMakeupLooks.coupleId, coupleId))).returning();
      res.json(look);
    } catch (error) {
      console.error("Error updating look:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere look" });
    }
  });
  app2.delete("/api/couple/hair-makeup/looks/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleHairMakeupLooks).where(and3(eq3(coupleHairMakeupLooks.id, id), eq3(coupleHairMakeupLooks.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting look:", error);
      res.status(500).json({ error: "Kunne ikke slette look" });
    }
  });
  app2.put("/api/couple/hair-makeup/timeline", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(coupleHairMakeupTimeline).where(eq3(coupleHairMakeupTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleHairMakeupTimeline).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleHairMakeupTimeline.coupleId, coupleId)).returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleHairMakeupTimeline).values({
          coupleId,
          ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });
  app2.get("/api/couple/transport", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [bookings, timelineRows] = await Promise.all([
        db.select().from(coupleTransportBookings).where(eq3(coupleTransportBookings.coupleId, coupleId)),
        db.select().from(coupleTransportTimeline).where(eq3(coupleTransportTimeline.coupleId, coupleId))
      ]);
      const timeline = timelineRows[0] || {
        brideCarBooked: false,
        groomCarBooked: false,
        guestShuttleBooked: false,
        getawayCarBooked: false,
        allConfirmed: false,
        budget: 0
      };
      res.json({ bookings, timeline });
    } catch (error) {
      console.error("Error fetching transport data:", error);
      res.status(500).json({ error: "Kunne ikke hente transport data" });
    }
  });
  app2.post("/api/couple/transport/bookings", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [booking] = await db.insert(coupleTransportBookings).values({
        coupleId,
        ...req.body
      }).returning();
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Kunne ikke opprette bestilling" });
    }
  });
  app2.patch("/api/couple/transport/bookings/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [booking] = await db.update(coupleTransportBookings).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleTransportBookings.id, id), eq3(coupleTransportBookings.coupleId, coupleId))).returning();
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere bestilling" });
    }
  });
  app2.delete("/api/couple/transport/bookings/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleTransportBookings).where(and3(eq3(coupleTransportBookings.id, id), eq3(coupleTransportBookings.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Kunne ikke slette bestilling" });
    }
  });
  app2.put("/api/couple/transport/timeline", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(coupleTransportTimeline).where(eq3(coupleTransportTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleTransportTimeline).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleTransportTimeline.coupleId, coupleId)).returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleTransportTimeline).values({
          coupleId,
          ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });
  app2.get("/api/couple/flowers", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [appointments, selections, timelineRows] = await Promise.all([
        db.select().from(coupleFlowerAppointments).where(eq3(coupleFlowerAppointments.coupleId, coupleId)).orderBy(coupleFlowerAppointments.date),
        db.select().from(coupleFlowerSelections).where(eq3(coupleFlowerSelections.coupleId, coupleId)),
        db.select().from(coupleFlowerTimeline).where(eq3(coupleFlowerTimeline.coupleId, coupleId))
      ]);
      const timeline = timelineRows[0] || {
        floristSelected: false,
        consultationDone: false,
        mockupApproved: false,
        deliveryConfirmed: false,
        budget: 0
      };
      res.json({ appointments, selections, timeline });
    } catch (error) {
      console.error("Error fetching flower data:", error);
      res.status(500).json({ error: "Kunne ikke hente blomster data" });
    }
  });
  app2.post("/api/couple/flowers/appointments", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [appointment] = await db.insert(coupleFlowerAppointments).values({
        coupleId,
        ...req.body
      }).returning();
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Kunne ikke opprette avtale" });
    }
  });
  app2.patch("/api/couple/flowers/appointments/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [appointment] = await db.update(coupleFlowerAppointments).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleFlowerAppointments.id, id), eq3(coupleFlowerAppointments.coupleId, coupleId))).returning();
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere avtale" });
    }
  });
  app2.delete("/api/couple/flowers/appointments/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleFlowerAppointments).where(and3(eq3(coupleFlowerAppointments.id, id), eq3(coupleFlowerAppointments.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: "Kunne ikke slette avtale" });
    }
  });
  app2.post("/api/couple/flowers/selections", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [selection] = await db.insert(coupleFlowerSelections).values({
        coupleId,
        ...req.body
      }).returning();
      res.json(selection);
    } catch (error) {
      console.error("Error creating selection:", error);
      res.status(500).json({ error: "Kunne ikke opprette valg" });
    }
  });
  app2.patch("/api/couple/flowers/selections/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [selection] = await db.update(coupleFlowerSelections).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleFlowerSelections.id, id), eq3(coupleFlowerSelections.coupleId, coupleId))).returning();
      res.json(selection);
    } catch (error) {
      console.error("Error updating selection:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere valg" });
    }
  });
  app2.delete("/api/couple/flowers/selections/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleFlowerSelections).where(and3(eq3(coupleFlowerSelections.id, id), eq3(coupleFlowerSelections.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting selection:", error);
      res.status(500).json({ error: "Kunne ikke slette valg" });
    }
  });
  app2.put("/api/couple/flowers/timeline", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(coupleFlowerTimeline).where(eq3(coupleFlowerTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleFlowerTimeline).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleFlowerTimeline.coupleId, coupleId)).returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleFlowerTimeline).values({
          coupleId,
          ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });
  app2.get("/api/couple/catering", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [tastings, menu, dietaryNeeds, timelineRows] = await Promise.all([
        db.select().from(coupleCateringTastings).where(eq3(coupleCateringTastings.coupleId, coupleId)).orderBy(coupleCateringTastings.date),
        db.select().from(coupleCateringMenu).where(eq3(coupleCateringMenu.coupleId, coupleId)),
        db.select().from(coupleCateringDietaryNeeds).where(eq3(coupleCateringDietaryNeeds.coupleId, coupleId)),
        db.select().from(coupleCateringTimeline).where(eq3(coupleCateringTimeline.coupleId, coupleId))
      ]);
      const timeline = timelineRows[0] || {
        catererSelected: false,
        tastingCompleted: false,
        menuFinalized: false,
        guestCountConfirmed: false,
        guestCount: 0,
        budget: 0
      };
      res.json({ tastings, menu, dietaryNeeds, timeline });
    } catch (error) {
      console.error("Error fetching catering data:", error);
      res.status(500).json({ error: "Kunne ikke hente catering data" });
    }
  });
  app2.post("/api/couple/catering/tastings", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [tasting] = await db.insert(coupleCateringTastings).values({
        coupleId,
        ...req.body
      }).returning();
      res.json(tasting);
    } catch (error) {
      console.error("Error creating tasting:", error);
      res.status(500).json({ error: "Kunne ikke opprette smakspr\xF8ve" });
    }
  });
  app2.patch("/api/couple/catering/tastings/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [tasting] = await db.update(coupleCateringTastings).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleCateringTastings.id, id), eq3(coupleCateringTastings.coupleId, coupleId))).returning();
      res.json(tasting);
    } catch (error) {
      console.error("Error updating tasting:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere smakspr\xF8ve" });
    }
  });
  app2.delete("/api/couple/catering/tastings/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleCateringTastings).where(and3(eq3(coupleCateringTastings.id, id), eq3(coupleCateringTastings.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tasting:", error);
      res.status(500).json({ error: "Kunne ikke slette smakspr\xF8ve" });
    }
  });
  app2.post("/api/couple/catering/menu", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [menuItem] = await db.insert(coupleCateringMenu).values({
        coupleId,
        ...req.body
      }).returning();
      res.json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ error: "Kunne ikke opprette rett" });
    }
  });
  app2.patch("/api/couple/catering/menu/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [menuItem] = await db.update(coupleCateringMenu).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleCateringMenu.id, id), eq3(coupleCateringMenu.coupleId, coupleId))).returning();
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere rett" });
    }
  });
  app2.delete("/api/couple/catering/menu/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleCateringMenu).where(and3(eq3(coupleCateringMenu.id, id), eq3(coupleCateringMenu.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ error: "Kunne ikke slette rett" });
    }
  });
  app2.post("/api/couple/catering/dietary", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [need] = await db.insert(coupleCateringDietaryNeeds).values({
        coupleId,
        ...req.body
      }).returning();
      res.json(need);
    } catch (error) {
      console.error("Error creating dietary need:", error);
      res.status(500).json({ error: "Kunne ikke opprette kostbehov" });
    }
  });
  app2.patch("/api/couple/catering/dietary/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [need] = await db.update(coupleCateringDietaryNeeds).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleCateringDietaryNeeds.id, id), eq3(coupleCateringDietaryNeeds.coupleId, coupleId))).returning();
      res.json(need);
    } catch (error) {
      console.error("Error updating dietary need:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kostbehov" });
    }
  });
  app2.delete("/api/couple/catering/dietary/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleCateringDietaryNeeds).where(and3(eq3(coupleCateringDietaryNeeds.id, id), eq3(coupleCateringDietaryNeeds.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dietary need:", error);
      res.status(500).json({ error: "Kunne ikke slette kostbehov" });
    }
  });
  app2.put("/api/couple/catering/timeline", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(coupleCateringTimeline).where(eq3(coupleCateringTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleCateringTimeline).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleCateringTimeline.coupleId, coupleId)).returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleCateringTimeline).values({
          coupleId,
          ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });
  app2.get("/api/couple/cake", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [tastings, designs, timelineRows] = await Promise.all([
        db.select().from(coupleCakeTastings).where(eq3(coupleCakeTastings.coupleId, coupleId)).orderBy(coupleCakeTastings.date),
        db.select().from(coupleCakeDesigns).where(eq3(coupleCakeDesigns.coupleId, coupleId)),
        db.select().from(coupleCakeTimeline).where(eq3(coupleCakeTimeline.coupleId, coupleId))
      ]);
      const timeline = timelineRows[0] || {
        bakerySelected: false,
        tastingCompleted: false,
        designFinalized: false,
        depositPaid: false,
        deliveryConfirmed: false,
        budget: 0
      };
      res.json({ tastings, designs, timeline });
    } catch (error) {
      console.error("Error fetching cake data:", error);
      res.status(500).json({ error: "Kunne ikke hente kake data" });
    }
  });
  app2.post("/api/couple/cake/tastings", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [tasting] = await db.insert(coupleCakeTastings).values({
        coupleId,
        ...req.body
      }).returning();
      res.json(tasting);
    } catch (error) {
      console.error("Error creating tasting:", error);
      res.status(500).json({ error: "Kunne ikke opprette smakspr\xF8ve" });
    }
  });
  app2.patch("/api/couple/cake/tastings/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [tasting] = await db.update(coupleCakeTastings).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleCakeTastings.id, id), eq3(coupleCakeTastings.coupleId, coupleId))).returning();
      res.json(tasting);
    } catch (error) {
      console.error("Error updating tasting:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere smakspr\xF8ve" });
    }
  });
  app2.delete("/api/couple/cake/tastings/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleCakeTastings).where(and3(eq3(coupleCakeTastings.id, id), eq3(coupleCakeTastings.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tasting:", error);
      res.status(500).json({ error: "Kunne ikke slette smakspr\xF8ve" });
    }
  });
  app2.post("/api/couple/cake/designs", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [design] = await db.insert(coupleCakeDesigns).values({
        coupleId,
        ...req.body
      }).returning();
      res.json(design);
    } catch (error) {
      console.error("Error creating design:", error);
      res.status(500).json({ error: "Kunne ikke opprette design" });
    }
  });
  app2.patch("/api/couple/cake/designs/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [design] = await db.update(coupleCakeDesigns).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleCakeDesigns.id, id), eq3(coupleCakeDesigns.coupleId, coupleId))).returning();
      res.json(design);
    } catch (error) {
      console.error("Error updating design:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere design" });
    }
  });
  app2.delete("/api/couple/cake/designs/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleCakeDesigns).where(and3(eq3(coupleCakeDesigns.id, id), eq3(coupleCakeDesigns.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting design:", error);
      res.status(500).json({ error: "Kunne ikke slette design" });
    }
  });
  app2.put("/api/couple/cake/timeline", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(coupleCakeTimeline).where(eq3(coupleCakeTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleCakeTimeline).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleCakeTimeline.coupleId, coupleId)).returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleCakeTimeline).values({
          coupleId,
          ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });
  app2.get("/api/couple/photographer", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [sessions, shots, timelineRows] = await Promise.all([
        db.select().from(couplePhotographerSessions).where(eq3(couplePhotographerSessions.coupleId, coupleId)).orderBy(couplePhotographerSessions.date),
        db.select().from(couplePhotographerShots).where(eq3(couplePhotographerShots.coupleId, coupleId)),
        db.select().from(couplePhotographerTimeline).where(eq3(couplePhotographerTimeline.coupleId, coupleId))
      ]);
      const timeline = timelineRows[0] || { photographerSelected: false, sessionBooked: false, contractSigned: false, depositPaid: false, budget: 0 };
      res.json({ sessions, shots, timeline });
    } catch (error) {
      console.error("Error fetching photographer data:", error);
      res.status(500).json({ error: "Kunne ikke hente fotograf data" });
    }
  });
  app2.post("/api/couple/photographer/sessions", async (req, res) => {
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
  app2.patch("/api/couple/photographer/sessions/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [session] = await db.update(couplePhotographerSessions).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(couplePhotographerSessions.id, id), eq3(couplePhotographerSessions.coupleId, coupleId))).returning();
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere session" });
    }
  });
  app2.delete("/api/couple/photographer/sessions/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(couplePhotographerSessions).where(and3(eq3(couplePhotographerSessions.id, id), eq3(couplePhotographerSessions.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Kunne ikke slette session" });
    }
  });
  app2.post("/api/couple/photographer/shots", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [shot] = await db.insert(couplePhotographerShots).values({ coupleId, ...req.body }).returning();
      res.json(shot);
    } catch (error) {
      console.error("Error creating shot:", error);
      res.status(500).json({ error: "Kunne ikke opprette bildeid\xE9" });
    }
  });
  app2.patch("/api/couple/photographer/shots/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [shot] = await db.update(couplePhotographerShots).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(couplePhotographerShots.id, id), eq3(couplePhotographerShots.coupleId, coupleId))).returning();
      res.json(shot);
    } catch (error) {
      console.error("Error updating shot:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere bildeid\xE9" });
    }
  });
  app2.delete("/api/couple/photographer/shots/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(couplePhotographerShots).where(and3(eq3(couplePhotographerShots.id, id), eq3(couplePhotographerShots.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting shot:", error);
      res.status(500).json({ error: "Kunne ikke slette bildeid\xE9" });
    }
  });
  app2.put("/api/couple/photographer/timeline", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(couplePhotographerTimeline).where(eq3(couplePhotographerTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(couplePhotographerTimeline).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(couplePhotographerTimeline.coupleId, coupleId)).returning();
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
  app2.get("/api/couple/videographer", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [sessions, deliverables, timelineRows] = await Promise.all([
        db.select().from(coupleVideographerSessions).where(eq3(coupleVideographerSessions.coupleId, coupleId)).orderBy(coupleVideographerSessions.date),
        db.select().from(coupleVideographerDeliverables).where(eq3(coupleVideographerDeliverables.coupleId, coupleId)),
        db.select().from(coupleVideographerTimeline).where(eq3(coupleVideographerTimeline.coupleId, coupleId))
      ]);
      const timeline = timelineRows[0] || { videographerSelected: false, sessionBooked: false, contractSigned: false, depositPaid: false, budget: 0 };
      res.json({ sessions, deliverables, timeline });
    } catch (error) {
      console.error("Error fetching videographer data:", error);
      res.status(500).json({ error: "Kunne ikke hente videograf data" });
    }
  });
  app2.post("/api/couple/videographer/sessions", async (req, res) => {
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
  app2.patch("/api/couple/videographer/sessions/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [session] = await db.update(coupleVideographerSessions).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleVideographerSessions.id, id), eq3(coupleVideographerSessions.coupleId, coupleId))).returning();
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere session" });
    }
  });
  app2.delete("/api/couple/videographer/sessions/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleVideographerSessions).where(and3(eq3(coupleVideographerSessions.id, id), eq3(coupleVideographerSessions.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Kunne ikke slette session" });
    }
  });
  app2.post("/api/couple/videographer/deliverables", async (req, res) => {
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
  app2.patch("/api/couple/videographer/deliverables/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [deliverable] = await db.update(coupleVideographerDeliverables).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleVideographerDeliverables.id, id), eq3(coupleVideographerDeliverables.coupleId, coupleId))).returning();
      res.json(deliverable);
    } catch (error) {
      console.error("Error updating deliverable:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere leveranse" });
    }
  });
  app2.delete("/api/couple/videographer/deliverables/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleVideographerDeliverables).where(and3(eq3(coupleVideographerDeliverables.id, id), eq3(coupleVideographerDeliverables.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting deliverable:", error);
      res.status(500).json({ error: "Kunne ikke slette leveranse" });
    }
  });
  app2.put("/api/couple/videographer/timeline", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(coupleVideographerTimeline).where(eq3(coupleVideographerTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleVideographerTimeline).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleVideographerTimeline.coupleId, coupleId)).returning();
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
  app2.get("/api/couple/music", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [performances, setlists, timelineRows] = await Promise.all([
        db.select().from(coupleMusicPerformances).where(eq3(coupleMusicPerformances.coupleId, coupleId)).orderBy(coupleMusicPerformances.date),
        db.select().from(coupleMusicSetlists).where(eq3(coupleMusicSetlists.coupleId, coupleId)),
        db.select().from(coupleMusicTimeline).where(eq3(coupleMusicTimeline.coupleId, coupleId))
      ]);
      const timeline = timelineRows[0] || { musicianSelected: false, setlistDiscussed: false, contractSigned: false, depositPaid: false, budget: 0 };
      res.json({ performances, setlists, timeline });
    } catch (error) {
      console.error("Error fetching music data:", error);
      res.status(500).json({ error: "Kunne ikke hente musikk data" });
    }
  });
  app2.post("/api/couple/music/performances", async (req, res) => {
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
  app2.patch("/api/couple/music/performances/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [performance] = await db.update(coupleMusicPerformances).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleMusicPerformances.id, id), eq3(coupleMusicPerformances.coupleId, coupleId))).returning();
      res.json(performance);
    } catch (error) {
      console.error("Error updating performance:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere opptreden" });
    }
  });
  app2.delete("/api/couple/music/performances/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleMusicPerformances).where(and3(eq3(coupleMusicPerformances.id, id), eq3(coupleMusicPerformances.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting performance:", error);
      res.status(500).json({ error: "Kunne ikke slette opptreden" });
    }
  });
  app2.post("/api/couple/music/setlists", async (req, res) => {
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
  app2.patch("/api/couple/music/setlists/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [setlist] = await db.update(coupleMusicSetlists).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(coupleMusicSetlists.id, id), eq3(coupleMusicSetlists.coupleId, coupleId))).returning();
      res.json(setlist);
    } catch (error) {
      console.error("Error updating setlist:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere spilleliste" });
    }
  });
  app2.delete("/api/couple/music/setlists/:id", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleMusicSetlists).where(and3(eq3(coupleMusicSetlists.id, id), eq3(coupleMusicSetlists.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting setlist:", error);
      res.status(500).json({ error: "Kunne ikke slette spilleliste" });
    }
  });
  app2.put("/api/couple/music/timeline", async (req, res) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(coupleMusicTimeline).where(eq3(coupleMusicTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleMusicTimeline).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(coupleMusicTimeline.coupleId, coupleId)).returning();
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
  app2.get("/api/faq/:category", async (req, res) => {
    try {
      const { category } = req.params;
      if (category !== "couple" && category !== "vendor") {
        return res.status(400).json({ error: "Ugyldig kategori" });
      }
      const items = await db.select().from(faqItems).where(and3(
        eq3(faqItems.category, category),
        eq3(faqItems.isActive, true)
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
      const items = await db.select().from(faqItems).where(eq3(faqItems.category, category)).orderBy(faqItems.sortOrder);
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
      const [item] = await db.update(faqItems).set(parsed).where(eq3(faqItems.id, id)).returning();
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
      await db.delete(faqItems).where(eq3(faqItems.id, id));
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
      const [setting] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
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
      const [existing] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      let setting;
      if (existing) {
        [setting] = await db.update(appSettings).set({ value: parsed.value, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(appSettings.key, key)).returning();
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
      const items = await db.select().from(whatsNewItems).where(and3(
        eq3(whatsNewItems.category, category),
        eq3(whatsNewItems.isActive, true)
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
      const items = await db.select().from(whatsNewItems).where(eq3(whatsNewItems.category, category)).orderBy(whatsNewItems.sortOrder);
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
      const [item] = await db.update(whatsNewItems).set({ ...parsed, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(whatsNewItems.id, id)).returning();
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
      await db.delete(whatsNewItems).where(eq3(whatsNewItems.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting what's new:", error);
      res.status(500).json({ error: "Kunne ikke slette hva som er nytt" });
    }
  });
  app2.get("/api/video-guides", async (req, res) => {
    try {
      const guides = await db.select().from(videoGuides).where(eq3(videoGuides.isActive, true)).orderBy(videoGuides.sortOrder);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching video guides:", error);
      res.status(500).json({ error: "Kunne ikke hente videoguider" });
    }
  });
  app2.get("/api/video-guides/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const guides = await db.select().from(videoGuides).where(
        and3(
          eq3(videoGuides.category, category),
          eq3(videoGuides.isActive, true)
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
      const guides = await db.select().from(videoGuides).where(eq3(videoGuides.category, category)).orderBy(videoGuides.sortOrder);
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
      const [guide] = await db.update(videoGuides).set({ ...parsed, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(videoGuides.id, id)).returning();
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
      await db.delete(videoGuides).where(eq3(videoGuides.id, id));
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
      const [conv] = await db.select().from(adminConversations).where(eq3(adminConversations.id, conversationId));
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
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, conversationId));
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
      const [conv] = await db.select().from(conversations).where(eq3(conversations.id, conversationId));
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
  registerCreatorhubRoutes(app2);
  return httpServer;
}

// server/cron-subscriptions.ts
import cron from "node-cron";
var API_URL = process.env.API_URL || "http://localhost:5000";
var ADMIN_SECRET = process.env.ADMIN_CRON_SECRET || "your-secure-admin-secret";
var scheduleExpiredTrialsCheck = () => {
  cron.schedule("0 9 * * *", async () => {
    console.log("[CRON] Running expired trials check...", (/* @__PURE__ */ new Date()).toISOString());
    try {
      const response = await fetch(`${API_URL}/api/admin/subscriptions/check-expired-trials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ADMIN_SECRET}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log("[CRON] Expired trials check completed:", result);
      if (result.expiredCount > 0) {
        console.log(`[CRON] \u2705 Paused ${result.expiredCount} expired trial(s)`);
      } else {
        console.log("[CRON] \u2139\uFE0F No expired trials found");
      }
    } catch (error) {
      console.error("[CRON] \u274C Error checking expired trials:", error);
    }
  });
  console.log("[CRON] \u2705 Expired trials check scheduled (daily at 09:00 UTC)");
};
var scheduleTrialReminders = () => {
  cron.schedule("0 10 * * *", async () => {
    console.log("[CRON] Running trial reminders...", (/* @__PURE__ */ new Date()).toISOString());
    try {
      const response = await fetch(`${API_URL}/api/admin/subscriptions/send-trial-reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ADMIN_SECRET}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log("[CRON] Trial reminders completed:", result);
      const total = result.reminders7d + result.reminders3d + result.reminders1d;
      if (total > 0) {
        console.log(`[CRON] \u2705 Sent ${total} reminder(s):`);
        console.log(`  - 7 days: ${result.reminders7d}`);
        console.log(`  - 3 days: ${result.reminders3d}`);
        console.log(`  - 1 day: ${result.reminders1d}`);
      } else {
        console.log("[CRON] \u2139\uFE0F No reminders to send");
      }
    } catch (error) {
      console.error("[CRON] \u274C Error sending trial reminders:", error);
    }
  });
  console.log("[CRON] \u2705 Trial reminders scheduled (daily at 10:00 UTC)");
};
var initializeSubscriptionCrons = () => {
  console.log("\n[CRON] Initializing subscription cron jobs...");
  scheduleExpiredTrialsCheck();
  scheduleTrialReminders();
  console.log("[CRON] All subscription cron jobs initialized\n");
};

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
    const allowedProdOrigins = [
      "https://wedflow.no",
      "https://www.wedflow.no",
      "https://api.wedflow.no",
      "https://wedflow-api.onrender.com",
      "https://wedflow-wedflow.vercel.app"
    ];
    const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    const isGitHubCodespaces = origin?.includes(".app.github.dev") || origin?.includes(".github.dev");
    const isCloudflare = origin?.includes(".trycloudflare.com");
    const isReplit = origin?.includes(".replit.dev") || origin?.includes(".repl.co");
    const allAllowedOrigins = /* @__PURE__ */ new Set([
      ...allowedProdOrigins,
      ...envAllowedOrigins
    ]);
    const isProductionDomain = origin ? allAllowedOrigins.has(origin) : false;
    const allowAnyOrigin = true;
    const shouldAllowOrigin = allowAnyOrigin || isDev || isLocalhost || isGitHubCodespaces || isCloudflare || isReplit || isProductionDomain;
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
  app.get("/terms-of-sale", (_req, res) => {
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
      initializeSubscriptionCrons();
    }
  );
})();
