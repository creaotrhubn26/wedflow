# Vendor Availability Calendar System - Complete Implementation

## Overview
Implemented a comprehensive calendar system for vendors to manage their date-based availability. This prevents double-booking and allows vendors to block dates or set capacity limits.

## Implementation Date
January 23, 2026

## Database Changes

### New Table: `vendor_availability`
**File:** `/migrations/0011_add_vendor_availability.sql`

```sql
CREATE TABLE vendor_availability (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'blocked', 'limited'
  max_bookings INTEGER, -- null for unlimited, required when status='limited'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, date)
);
```

**Indexes:**
- `vendor_availability_vendor` - Fast lookups by vendor
- `vendor_availability_date` - Fast lookups by date
- `vendor_availability_vendor_date` - Combined index for main query pattern

## Schema Updates

**File:** `/shared/schema.ts`

### New Table Definition
```typescript
export const vendorAvailability = pgTable("vendor_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  status: text("status").notNull().default("available"),
  maxBookings: integer("max_bookings"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### TypeScript Types
```typescript
export type VendorAvailability = typeof vendorAvailability.$inferSelect;
export type InsertVendorAvailability = z.infer<typeof insertVendorAvailabilitySchema>;
export type CreateVendorAvailability = z.infer<typeof createVendorAvailabilitySchema>;
```

### Validation Schema
```typescript
export const createVendorAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig datoformat"),
  status: z.enum(["available", "blocked", "limited"]),
  maxBookings: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});
```

## Backend API Routes

**File:** `/server/routes.ts`

### Endpoints

#### 1. Get All Availability
```
GET /api/vendor/availability?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```
Returns all availability entries for the vendor, optionally filtered by date range.

#### 2. Get Availability for Specific Date
```
GET /api/vendor/availability/:date
```
Returns availability entry for a specific date, or null if not set.

#### 3. Create/Update Availability
```
POST /api/vendor/availability
Body: {
  date: string,
  status: "available" | "blocked" | "limited",
  maxBookings?: number | null,
  notes?: string | null
}
```
Creates new or updates existing availability entry. Uses upsert pattern.

#### 4. Bulk Update Availability
```
POST /api/vendor/availability/bulk
Body: {
  dates: string[],
  status: string,
  maxBookings?: number,
  notes?: string
}
```
Updates multiple dates at once (useful for blocking vacation periods).

#### 5. Delete Availability
```
DELETE /api/vendor/availability/:date
```
Removes availability entry, resetting date to default (available).

#### 6. Get Bookings for Date
```
GET /api/vendor/availability/:date/bookings
```
Returns count of accepted offers for the specified date.

### Availability Checking in Offer Creation

**Enhanced:** `POST /api/vendor/offers`

Now checks vendor availability before allowing offer creation:

1. **Blocked Dates**: Returns 400 error if date is blocked
2. **Limited Capacity**: Checks if max bookings reached, blocks if full
3. **Error Response Format**:
```json
{
  "error": "Datoen 15. juni 2026 er blokkert",
  "reason": "Dato ikke tilgjengelig",
  "blocked": true
}
```

## Frontend Implementation

### New Screen: VendorAvailabilityScreen
**File:** `/client/screens/VendorAvailabilityScreen.tsx`

#### Features
1. **Monthly Calendar View**
   - Grid layout with weekdays
   - Visual indicators for status (blocked, limited, booked)
   - Tap any future date to edit
   - Past dates are grayed out and non-interactive

2. **Status Types**
   - ✅ **Available** (green) - Default, unlimited bookings
   - 🚫 **Blocked** (red) - No offers can be created
   - ⚠️ **Limited** (orange) - Max bookings limit enforced

3. **Visual Indicators**
   - Booking count badges (green) show active bookings
   - Status icons in top-right of each date
   - Max booking count displayed for limited dates

4. **Edit Modal**
   - Select status: Available, Blocked, or Limited
   - Set max bookings (for limited status)
   - Add optional notes
   - Delete button to reset to default

5. **Statistics Card**
   - Count of blocked dates
   - Count of limited dates
   - Total active bookings

6. **Legend**
   - Color-coded explanation of calendar indicators

#### Technical Details
- Uses `@tanstack/react-query` for data fetching
- Real-time refetch on pull-to-refresh
- Optimistic UI updates
- Haptic feedback on interactions
- Modal presentation for editing
- Responsive grid layout

### Navigation Integration

**Files Modified:**
- `/client/navigation/RootStackNavigator.tsx`
- `/client/screens/VendorDashboardScreen.tsx`

#### Added Route
```typescript
VendorAvailability: undefined
```

#### Navigation Button
Added calendar icon button to VendorDashboard header:
- Position: Between logout and help buttons
- Icon: `calendar` (Feather icon)
- Color: Accent color
- Accessibility label: "Kalender & Tilgjengelighet"

## User Flow

### Setting Availability

1. Vendor taps calendar icon in dashboard header
2. Views monthly calendar with current bookings
3. Taps a date to edit
4. Selects status:
   - **Blocked**: For vacation, fully booked days
   - **Limited**: Set max bookings (e.g., 2 weddings per day)
   - **Available**: Remove restrictions
5. Optionally adds notes
6. Saves changes

### Offer Creation with Availability Check

1. Vendor creates offer for couple
2. System checks couple's wedding date
3. If date is **blocked**: Error shown, offer blocked
4. If date is **limited** and full: Error shown, offer blocked
5. If date is available or has capacity: Offer created successfully

### Error Messages

**Blocked Date:**
```
"Datoen 15. juni 2026 er blokkert og kan ikke ta imot tilbud."
```

**Capacity Reached:**
```
"Datoen 15. juni 2026 har nådd maksimal kapasitet (2 bookinger)."
```

## Real-World Use Cases

### Example 1: Photographer Blocks Vacation
```
Status: Blocked
Dates: July 1-14, 2026
Notes: "Summer vacation - Greece"
Result: Any couples with wedding dates in this range cannot receive offers
```

### Example 2: Venue with Multiple Event Spaces
```
Status: Limited
Max Bookings: 2
Dates: Every Saturday
Notes: "Can host 2 weddings simultaneously"
Result: First 2 couples can get offers, 3rd and beyond are blocked
```

### Example 3: DJ with Travel Days
```
Status: Blocked
Dates: Day after each wedding
Notes: "Travel/recovery day"
Result: Prevents back-to-back bookings
```

## Testing Scenarios

### Scenario 1: Block a Date
```
1. Navigate to calendar
2. Tap June 15, 2026
3. Select "Blocked"
4. Add note: "Already booked private event"
5. Save
6. Verify red X icon appears on calendar
7. Try creating offer for couple with June 15 wedding
8. Verify error message shown
```

### Scenario 2: Limited Capacity
```
1. Set Saturday, June 20 to "Limited" with max 2 bookings
2. Create offer for first couple (June 20) - Success
3. Accept offer #1
4. Create offer for second couple (June 20) - Success
5. Accept offer #2
6. Try creating offer for third couple (June 20) - Error
7. Verify "capacity reached" message
```

### Scenario 3: Remove Restriction
```
1. View calendar with blocked date
2. Tap blocked date
3. Select "Available"
4. Delete (or save as available)
5. Verify date returns to normal appearance
6. Verify offers can now be created for that date
```

## Database Migration Instructions

### To Apply Migration

```bash
# Option 1: Using npm script
npm run db:push

# Option 2: Manually with psql
psql -h [HOST] -U [USER] -d [DB] -f migrations/0011_add_vendor_availability.sql

# Option 3: Using Drizzle Kit
npx drizzle-kit push:pg
```

### Rollback (if needed)
```sql
DROP TABLE IF EXISTS vendor_availability CASCADE;
```

## Performance Considerations

### Indexes
- Primary lookups use vendor_id + date composite index
- Single-date queries use date index
- All queries should use index-only scans

### Query Patterns
- Calendar view: Single query with date range filter
- Offer creation: Single lookup by vendor_id + wedding date
- Bookings count: JOIN with couple_profiles on wedding date

### Caching Strategy
- React Query caches availability for 5 minutes
- Invalidates on mutations (create, update, delete)
- Background refetch on window focus

## Future Enhancements (Not Implemented)

### Potential Additions
1. **Recurring Availability**
   - "Block all Sundays"
   - "Limit Saturdays to 3 bookings"
   
2. **Capacity by Product**
   - Different limits for different services
   - "2 full packages, unlimited partial packages"

3. **Tentative Holds**
   - Reserve date while couple decides
   - Auto-release after timeout

4. **Calendar Import/Export**
   - Sync with Google Calendar
   - iCal export

5. **Availability Templates**
   - Save common patterns
   - "Summer season schedule"
   - "Holiday availability"

6. **Automated Blocking**
   - Auto-block day after accepted wedding
   - Auto-block based on travel distance

## Files Changed

### Database
- ✅ `/migrations/0011_add_vendor_availability.sql` (NEW)

### Backend
- ✅ `/shared/schema.ts` (MODIFIED - added vendorAvailability table)
- ✅ `/server/routes.ts` (MODIFIED - added 6 API routes + availability checking)

### Frontend
- ✅ `/client/screens/VendorAvailabilityScreen.tsx` (NEW - 800 lines)
- ✅ `/client/navigation/RootStackNavigator.tsx` (MODIFIED - added route and import)
- ✅ `/client/screens/VendorDashboardScreen.tsx` (MODIFIED - added calendar button)

## Total Impact

- **Lines of Code Added:** ~1,200
- **New API Endpoints:** 6
- **New Database Tables:** 1
- **New Frontend Screens:** 1
- **Modified Files:** 4

## Status

✅ **COMPLETE** - All functionality implemented and ready for deployment

**Next Steps:**
1. Run database migration: `migrations/0011_add_vendor_availability.sql`
2. Test in staging environment
3. Deploy to production
4. Monitor vendor adoption

---

**Implementation completed by:** GitHub Copilot (Claude Sonnet 4.5)
**Date:** January 23, 2026
