# Inventory Tracking Implementation Plan

## Problem
Vendors can have limited quantities of items (chairs, tables, equipment) but there's currently no way to:
1. Track available inventory
2. Prevent overbooking
3. Show couples when they've exceeded available quantities

## Solution Overview

### 1. Database Schema Changes

Add inventory tracking to `vendorProducts` table:

```typescript
// Add to vendorProducts in shared/schema.ts
export const vendorProducts = pgTable("vendor_products", {
  // ... existing fields ...
  
  // NEW FIELDS:
  trackInventory: boolean("track_inventory").default(false), // Enable/disable inventory tracking
  availableQuantity: integer("available_quantity"), // Total available (e.g., 200 chairs)
  reservedQuantity: integer("reserved_quantity").default(0), // Currently reserved in pending offers
  bookingBuffer: integer("booking_buffer").default(0), // Safety buffer (e.g., keep 10 chairs always available)
});
```

### 2. Migration Script

```sql
-- migrations/0010_add_inventory_tracking.sql
ALTER TABLE vendor_products 
  ADD COLUMN track_inventory BOOLEAN DEFAULT FALSE,
  ADD COLUMN available_quantity INTEGER,
  ADD COLUMN reserved_quantity INTEGER DEFAULT 0,
  ADD COLUMN booking_buffer INTEGER DEFAULT 0;
```

### 3. Backend API Changes

#### A. When Creating/Updating Offers
```typescript
// Check inventory availability before creating offer
app.post("/api/vendor/offers", async (req, res) => {
  // ... existing auth ...
  
  const { items } = req.body;
  
  // Check each item's availability
  for (const item of items) {
    if (item.productId) {
      const [product] = await db.select()
        .from(vendorProducts)
        .where(eq(vendorProducts.id, item.productId));
      
      if (product.trackInventory) {
        const available = product.availableQuantity - product.reservedQuantity - product.bookingBuffer;
        if (item.quantity > available) {
          return res.status(400).json({
            error: `Ikke nok tilgjengelig for "${product.title}". Tilgjengelig: ${available}, Forespurt: ${item.quantity}`,
            productId: item.productId,
            available,
            requested: item.quantity
          });
        }
      }
    }
  }
  
  // ... create offer and reserve quantities ...
});
```

#### B. Reserve Quantities When Offer Created
```typescript
// When offer is created (status: pending)
for (const item of items) {
  if (item.productId) {
    await db.update(vendorProducts)
      .set({
        reservedQuantity: sql`${vendorProducts.reservedQuantity} + ${item.quantity}`
      })
      .where(eq(vendorProducts.id, item.productId));
  }
}
```

#### C. Release/Confirm Quantities Based on Offer Status
```typescript
// When offer is accepted
app.post("/api/couple/offers/:offerId/respond", async (req, res) => {
  const { response } = req.body; // "accept" or "decline"
  
  if (response === "accept") {
    // Keep reserved, maybe reduce availableQuantity permanently
    for (const item of offer.items) {
      if (item.productId) {
        await db.update(vendorProducts)
          .set({
            availableQuantity: sql`${vendorProducts.availableQuantity} - ${item.quantity}`,
            reservedQuantity: sql`${vendorProducts.reservedQuantity} - ${item.quantity}`
          })
          .where(eq(vendorProducts.id, item.productId));
      }
    }
  } else {
    // Release reservation
    for (const item of offer.items) {
      if (item.productId) {
        await db.update(vendorProducts)
          .set({
            reservedQuantity: sql`${vendorProducts.reservedQuantity} - ${item.quantity}`
          })
          .where(eq(vendorProducts.id, item.productId));
      }
    }
  }
});
```

### 4. Frontend Changes

#### A. Vendor Product Management Screen
Add fields to manage inventory:

```tsx
// In vendor product creation/edit form
<View>
  <Switch
    value={trackInventory}
    onValueChange={setTrackInventory}
    label="Aktiver lagerstyring"
  />
  
  {trackInventory && (
    <>
      <TextInput
        label="Totalt antall tilgjengelig"
        placeholder="200"
        value={availableQuantity}
        onChangeText={setAvailableQuantity}
        keyboardType="number-pad"
      />
      <TextInput
        label="Sikkerhetsbuffer"
        placeholder="10"
        value={bookingBuffer}
        onChangeText={setBookingBuffer}
        keyboardType="number-pad"
        helperText="Antall som alltid holdes tilbake"
      />
      <ThemedText style={{ color: theme.textMuted }}>
        Tilgjengelig for booking: {availableQuantity - reservedQuantity - bookingBuffer}
      </ThemedText>
    </>
  )}
</View>
```

#### B. Offer Creation Screen (Vendor Side)
Show availability when adding items:

```tsx
// When vendor selects a product
const getAvailabilityStatus = (product: VendorProduct) => {
  if (!product.trackInventory) return null;
  
  const available = product.availableQuantity - product.reservedQuantity - product.bookingBuffer;
  
  return (
    <View style={styles.availabilityBadge}>
      <Feather 
        name={available > 10 ? "check-circle" : available > 0 ? "alert-circle" : "x-circle"} 
        size={14} 
        color={available > 10 ? Colors.success : available > 0 ? Colors.warning : Colors.error}
      />
      <ThemedText style={{ fontSize: 12, marginLeft: 4 }}>
        {available} tilgjengelig
      </ThemedText>
    </View>
  );
};

// In quantity input
<TextInput
  label={`Antall (maks: ${available})`}
  value={quantity}
  onChangeText={(value) => {
    const num = parseInt(value);
    if (num > available) {
      Alert.alert(
        "Ikke nok tilgjengelig",
        `Du kan maks velge ${available} stk. Det er ${product.reservedQuantity} reservert i andre tilbud.`
      );
      return;
    }
    setQuantity(value);
  }}
  keyboardType="number-pad"
/>
```

#### C. Couple Offer View
Show inventory constraints clearly:

```tsx
// In CoupleOffersScreen when viewing offer items
{offer.items.map((item) => (
  <View key={item.id} style={styles.offerItem}>
    <ThemedText>{item.title}</ThemedText>
    <View style={styles.itemMeta}>
      <ThemedText>{item.quantity} × {formatPrice(item.unitPrice)}</ThemedText>
      
      {/* Show if this product has inventory tracking */}
      {item.product?.trackInventory && (
        <View style={[styles.inventoryBadge, {
          backgroundColor: item.exceedsInventory ? Colors.errorLight : Colors.successLight
        }]}>
          <Feather 
            name={item.exceedsInventory ? "alert-triangle" : "check"} 
            size={12} 
            color={item.exceedsInventory ? Colors.error : Colors.success}
          />
          <ThemedText style={{
            fontSize: 11,
            color: item.exceedsInventory ? Colors.error : Colors.success,
            marginLeft: 4
          }}>
            {item.exceedsInventory 
              ? `Kun ${item.product.availableQuantity} tilgjengelig` 
              : 'På lager'
            }
          </ThemedText>
        </View>
      )}
    </View>
  </View>
))}
```

### 5. Real-time Inventory Updates

Add WebSocket or polling to show live inventory:

```tsx
// Poll for inventory updates when viewing offer
useEffect(() => {
  const interval = setInterval(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/vendor/products'] });
  }, 30000); // Every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

### 6. Vendor Dashboard Inventory Overview

Create an inventory management view:

```tsx
// New screen: VendorInventoryScreen.tsx
export default function VendorInventoryScreen() {
  return (
    <FlatList
      data={products.filter(p => p.trackInventory)}
      renderItem={({ item }) => (
        <Card>
          <ThemedText variant="h3">{item.title}</ThemedText>
          <View style={styles.inventoryStats}>
            <View>
              <ThemedText style={styles.statLabel}>Totalt</ThemedText>
              <ThemedText style={styles.statValue}>{item.availableQuantity}</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.statLabel}>Reservert</ThemedText>
              <ThemedText style={[styles.statValue, { color: Colors.warning }]}>
                {item.reservedQuantity}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={styles.statLabel}>Tilgjengelig</ThemedText>
              <ThemedText style={[styles.statValue, { color: Colors.success }]}>
                {item.availableQuantity - item.reservedQuantity - item.bookingBuffer}
              </ThemedText>
            </View>
          </View>
          
          {/* Show which offers have reserved quantities */}
          <Pressable onPress={() => navigation.navigate('ReservationDetails', { productId: item.id })}>
            <ThemedText style={{ color: theme.primary }}>
              Se reservasjoner →
            </ThemedText>
          </Pressable>
        </Card>
      )}
    />
  );
}
```

## Implementation Steps

1. **Phase 1: Database**
   - [ ] Create migration for new inventory fields
   - [ ] Run migration on development database
   - [ ] Update schema.ts with new fields

2. **Phase 2: Backend Logic**
   - [ ] Add inventory check to offer creation endpoint
   - [ ] Implement reservation logic (reserve on create, release on decline, confirm on accept)
   - [ ] Add endpoint to get product availability
   - [ ] Handle offer expiration (release reserved quantities)

3. **Phase 3: Vendor UI**
   - [ ] Update product creation/edit form with inventory fields
   - [ ] Show availability in offer creation screen
   - [ ] Create inventory dashboard screen
   - [ ] Add validation to prevent overbooking

4. **Phase 4: Couple UI**
   - [ ] Show inventory constraints in offer view
   - [ ] Display warnings when quantities are limited
   - [ ] Real-time availability updates

5. **Phase 5: Testing**
   - [ ] Test reservation flow (create → accept/decline)
   - [ ] Test concurrent bookings
   - [ ] Test buffer logic
   - [ ] Test edge cases (0 inventory, expired offers)

## Benefits

✅ **Prevents overbooking** - Vendors can't accidentally accept more bookings than they have capacity for
✅ **Transparent to couples** - Couples see immediately if requested quantities are available
✅ **Professional** - Shows vendors are organized and have proper inventory management
✅ **Flexible** - Vendors can choose which products need tracking (not all products need it)
✅ **Buffer protection** - Vendors can keep safety stock
✅ **Real-time** - Reserved quantities are tracked across all pending offers

## Example User Flow

### Vendor: Creating Product
1. Creates "White Chiavari Chairs" product
2. Enables inventory tracking
3. Sets available quantity: 200
4. Sets buffer: 10 (always keep 10 available for emergencies)
5. System shows: "190 available for booking"

### Vendor: Creating Offer
1. Selects "White Chiavari Chairs"
2. Sees badge: "190 available"
3. Enters quantity: 150
4. Creates offer → System reserves 150 chairs
5. Now shows "40 available" for other couples

### Couple: Viewing Offer
1. Sees offer with 150 chairs
2. Badge shows: "✓ På lager" (in stock)
3. Can accept with confidence

### If Another Couple Requests 60 Chairs
1. Vendor tries to create offer with 60 chairs
2. System shows warning: "Kun 40 tilgjengelig. 150 er reservert i andre tilbud"
3. Vendor can either:
   - Reduce quantity to 40
   - Wait for first offer to be accepted/declined
   - Increase total inventory
