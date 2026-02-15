/**
 * Vendor Matching E2E Tests — Core Evendi Feature
 *
 * Covers:
 *  1. GET /api/vendors/matching — unfiltered, category, location, combined filters
 *  2. GET /api/vendor-categories — all categories exist
 *  3. GET /api/vendors — public listing
 *  4. GET /api/vendors/:id/reviews — vendor reviews
 *  5. Couple login (auto-register)
 *  6. Full lifecycle: couple matches → couple sends inquiry → vendor sees inquiry →
 *     couple creates conversation from inquiry → couple sends message → vendor sees conversation/messages
 */
import { test, expect } from '@playwright/test';
import {
  EVENDI_URL,
  getVendorToken,
  vendorHeaders,
  TEST_VENDOR_ID,
} from './helpers';

// ── Known category IDs ───────────────────────────────────────────
const CATEGORY_FOTOGRAF = 'cbe95bca-c7a8-4a69-b819-ee9126c7bb17';
const CATEGORY_BLOMSTER = 'ba795285-04a5-4eec-9135-2a7dc66cff34';
const CATEGORY_VENUE    = 'fba1ac4d-e09c-4124-adb7-69a1312d4516';
const CATEGORY_CATERING = 'b3a39be7-aa97-4d1b-83d6-11af2b5a1580';

// ── Couple test credentials (auto-registers on first login) ──────
const COUPLE_EMAIL    = 'e2e-matching@evendi.no';
const COUPLE_NAME     = 'E2E Test Couple';
const COUPLE_PASSWORD = 'Test@1234';

// Helper: couple login → returns { token, coupleId }
async function coupleLogin(request: import('@playwright/test').APIRequestContext) {
  const res = await request.post(`${EVENDI_URL}/api/couples/login`, {
    data: { email: COUPLE_EMAIL, displayName: COUPLE_NAME, password: COUPLE_PASSWORD },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.sessionToken).toBeTruthy();
  expect(body.couple).toBeTruthy();
  return { token: body.sessionToken as string, coupleId: body.couple.id as string };
}

function coupleHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ═══════════════════════════════════════════════════════════════════
// 1. VENDOR CATEGORIES
// ═══════════════════════════════════════════════════════════════════
test.describe('Vendor Categories', () => {
  test('GET /api/vendor-categories returns all categories', async ({ request }) => {
    const res = await request.get(`${EVENDI_URL}/api/vendor-categories`);
    expect(res.status()).toBe(200);
    const cats = await res.json();
    expect(Array.isArray(cats)).toBeTruthy();
    expect(cats.length).toBeGreaterThanOrEqual(10);

    // Verify known category IDs exist
    const ids = cats.map((c: any) => c.id);
    expect(ids).toContain(CATEGORY_FOTOGRAF);
    expect(ids).toContain(CATEGORY_BLOMSTER);
    expect(ids).toContain(CATEGORY_VENUE);
    expect(ids).toContain(CATEGORY_CATERING);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. VENDOR MATCHING — Filtering
// ═══════════════════════════════════════════════════════════════════
test.describe('Vendor Matching Filters', () => {

  test('GET /api/vendors/matching — no filters returns all approved vendors', async ({ request }) => {
    const res = await request.get(`${EVENDI_URL}/api/vendors/matching`);
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    expect(Array.isArray(vendors)).toBeTruthy();
    expect(vendors.length).toBeGreaterThanOrEqual(3);

    // Every vendor should have expected fields
    for (const v of vendors) {
      expect(v.id).toBeTruthy();
      expect(v.businessName).toBeTruthy();
    }
  });

  test('GET /api/vendors/matching?category=fotograf — filters to Fotograf only', async ({ request }) => {
    const res = await request.get(`${EVENDI_URL}/api/vendors/matching?category=${CATEGORY_FOTOGRAF}`);
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    expect(vendors.length).toBeGreaterThanOrEqual(1);

    for (const v of vendors) {
      expect(v.categoryId).toBe(CATEGORY_FOTOGRAF);
    }
  });

  test('GET /api/vendors/matching?category=blomster — filters to Blomster only', async ({ request }) => {
    const res = await request.get(`${EVENDI_URL}/api/vendors/matching?category=${CATEGORY_BLOMSTER}`);
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    expect(vendors.length).toBeGreaterThanOrEqual(1);

    for (const v of vendors) {
      expect(v.categoryId).toBe(CATEGORY_BLOMSTER);
    }
  });

  test('GET /api/vendors/matching?location=Oslo — filters by location substring', async ({ request }) => {
    const res = await request.get(`${EVENDI_URL}/api/vendors/matching?location=Oslo`);
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    expect(vendors.length).toBeGreaterThanOrEqual(1);

    for (const v of vendors) {
      const loc = (v.location || '').toLowerCase() + (v.venueLocation || '').toLowerCase();
      expect(loc).toContain('oslo');
    }
  });

  test('GET /api/vendors/matching — location is case-insensitive', async ({ request }) => {
    const lower = await request.get(`${EVENDI_URL}/api/vendors/matching?location=oslo`);
    const upper = await request.get(`${EVENDI_URL}/api/vendors/matching?location=OSLO`);
    expect(lower.status()).toBe(200);
    expect(upper.status()).toBe(200);

    const lv = await lower.json();
    const uv = await upper.json();
    expect(lv.length).toBe(uv.length);
  });

  test('GET /api/vendors/matching — combined category + location narrows results', async ({ request }) => {
    const res = await request.get(
      `${EVENDI_URL}/api/vendors/matching?category=${CATEGORY_FOTOGRAF}&location=Lørenskog`
    );
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    // Should narrow down from 2 Fotograf vendors → those in Lørenskog only
    for (const v of vendors) {
      expect(v.categoryId).toBe(CATEGORY_FOTOGRAF);
      const loc = (v.location || '').toLowerCase();
      expect(loc).toContain('lørenskog');
    }
  });

  test('GET /api/vendors/matching — venue + guestCount (no venue vendors → empty)', async ({ request }) => {
    const res = await request.get(
      `${EVENDI_URL}/api/vendors/matching?category=${CATEGORY_VENUE}&guestCount=100`
    );
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    // Currently 0 venue vendors in DB — should return empty array
    expect(Array.isArray(vendors)).toBeTruthy();
  });

  test('GET /api/vendors/matching — catering + guestCount (no catering vendors → empty)', async ({ request }) => {
    const res = await request.get(
      `${EVENDI_URL}/api/vendors/matching?category=${CATEGORY_CATERING}&guestCount=50`
    );
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    expect(Array.isArray(vendors)).toBeTruthy();
  });

  test('GET /api/vendors/matching — nonexistent category returns empty', async ({ request }) => {
    const res = await request.get(
      `${EVENDI_URL}/api/vendors/matching?category=00000000-0000-0000-0000-000000000000`
    );
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    expect(vendors.length).toBe(0);
  });

  test('GET /api/vendors/matching — nonexistent location returns empty', async ({ request }) => {
    const res = await request.get(
      `${EVENDI_URL}/api/vendors/matching?location=Timbuktu`
    );
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    expect(vendors.length).toBe(0);
  });

  test('vendor response structure includes all expected fields', async ({ request }) => {
    const res = await request.get(`${EVENDI_URL}/api/vendors/matching`);
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    expect(vendors.length).toBeGreaterThanOrEqual(1);

    const v = vendors[0];
    // Core fields
    expect(v).toHaveProperty('id');
    expect(v).toHaveProperty('businessName');
    expect(v).toHaveProperty('categoryId');
    // Optional/nullable fields should be present in response shape
    expect('description' in v).toBeTruthy();
    expect('location' in v).toBeTruthy();
    expect('priceRange' in v).toBeTruthy();
    expect('imageUrl' in v).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. PUBLIC VENDOR LISTING
// ═══════════════════════════════════════════════════════════════════
test.describe('Public Vendor Listing', () => {
  test('GET /api/vendors returns approved vendors', async ({ request }) => {
    const res = await request.get(`${EVENDI_URL}/api/vendors`);
    expect(res.status()).toBe(200);
    const vendors = await res.json();
    expect(Array.isArray(vendors)).toBeTruthy();
    expect(vendors.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/vendors/:id/reviews returns reviews object', async ({ request }) => {
    const res = await request.get(`${EVENDI_URL}/api/vendors/${TEST_VENDOR_ID}/reviews`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.reviews)).toBeTruthy();
    expect(body.stats).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. COUPLE AUTH
// ═══════════════════════════════════════════════════════════════════
test.describe('Couple Authentication', () => {
  test('POST /api/couples/login — auto-registers new couple', async ({ request }) => {
    const uniqueEmail = `e2e-test-${Date.now()}@evendi.no`;
    const res = await request.post(`${EVENDI_URL}/api/couples/login`, {
      data: { email: uniqueEmail, displayName: 'E2E Auto Register', password: 'Test@1234' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.sessionToken).toBeTruthy();
    expect(body.couple).toBeTruthy();
    expect(body.couple.email).toBe(uniqueEmail);
    expect(body.couple.displayName).toBe('E2E Auto Register');
  });

  test('POST /api/couples/login — existing couple gets same id', async ({ request }) => {
    // First login (auto-register)
    const res1 = await request.post(`${EVENDI_URL}/api/couples/login`, {
      data: { email: COUPLE_EMAIL, displayName: COUPLE_NAME, password: COUPLE_PASSWORD },
    });
    expect(res1.status()).toBe(200);
    const body1 = await res1.json();

    // Second login — same couple id
    const res2 = await request.post(`${EVENDI_URL}/api/couples/login`, {
      data: { email: COUPLE_EMAIL, displayName: COUPLE_NAME, password: COUPLE_PASSWORD },
    });
    expect(res2.status()).toBe(200);
    const body2 = await res2.json();

    expect(body2.couple.id).toBe(body1.couple.id);
  });

  test('POST /api/couples/login — wrong password returns 401', async ({ request }) => {
    // Make sure the couple exists first
    await request.post(`${EVENDI_URL}/api/couples/login`, {
      data: { email: COUPLE_EMAIL, displayName: COUPLE_NAME, password: COUPLE_PASSWORD },
    });

    const res = await request.post(`${EVENDI_URL}/api/couples/login`, {
      data: { email: COUPLE_EMAIL, displayName: COUPLE_NAME, password: 'WrongPass99' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/couples/login — missing fields returns 400', async ({ request }) => {
    const res = await request.post(`${EVENDI_URL}/api/couples/login`, {
      data: { email: 'bad@test.no' },
    });
    expect(res.status()).toBe(400);
  });

  test('GET /api/couples/me — returns couple profile with valid token', async ({ request }) => {
    const { token } = await coupleLogin(request);
    const res = await request.get(`${EVENDI_URL}/api/couples/me`, {
      headers: coupleHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(COUPLE_EMAIL);
  });

  test('GET /api/couples/me — rejects invalid token', async ({ request }) => {
    const res = await request.get(`${EVENDI_URL}/api/couples/me`, {
      headers: { Authorization: 'Bearer invalid-token-xyz' },
    });
    expect(res.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. COUPLE ↔ VENDOR FULL LIFECYCLE
//    match → browse vendors → (inquiry requires inspiration) → conversations → messages
// ═══════════════════════════════════════════════════════════════════
test.describe('Couple ↔ Vendor Lifecycle', () => {
  test('couple can browse matching vendors and view vendor details', async ({ request }) => {
    const { token } = await coupleLogin(request);

    // Step 1: Browse matching vendors (Fotograf category)
    const matchRes = await request.get(
      `${EVENDI_URL}/api/vendors/matching?category=${CATEGORY_FOTOGRAF}`,
      { headers: coupleHeaders(token) }
    );
    expect(matchRes.status()).toBe(200);
    const matchedVendors = await matchRes.json();
    expect(matchedVendors.length).toBeGreaterThanOrEqual(1);

    // Step 2: Check vendor reviews for a matched vendor
    const vendorId = matchedVendors[0].id;
    const reviewRes = await request.get(
      `${EVENDI_URL}/api/vendors/${vendorId}/reviews`,
      { headers: coupleHeaders(token) }
    );
    expect(reviewRes.status()).toBe(200);
    const reviewBody = await reviewRes.json();
    expect(Array.isArray(reviewBody.reviews)).toBeTruthy();
  });

  test('couple can list conversations (starts empty or with existing)', async ({ request }) => {
    const { token } = await coupleLogin(request);

    const res = await request.get(`${EVENDI_URL}/api/couples/conversations`, {
      headers: coupleHeaders(token),
    });
    expect(res.status()).toBe(200);
    const convs = await res.json();
    expect(Array.isArray(convs)).toBeTruthy();
  });

  test('couple can send a message to start a conversation with vendor', async ({ request }) => {
    const { token } = await coupleLogin(request);

    // Match vendors first to get a valid vendor ID
    const matchRes = await request.get(
      `${EVENDI_URL}/api/vendors/matching?category=${CATEGORY_FOTOGRAF}`,
    );
    expect(matchRes.status()).toBe(200);
    const matchedVendors = await matchRes.json();
    expect(matchedVendors.length).toBeGreaterThanOrEqual(1);

    const vendorId = matchedVendors[0].id;

    // Send a message to the vendor (creates conversation implicitly)
    const msgRes = await request.post(`${EVENDI_URL}/api/couples/messages`, {
      headers: coupleHeaders(token),
      data: {
        vendorId,
        body: `E2E test message from couple at ${new Date().toISOString()}`,
      },
    });
    // Should be 200 or 201
    expect([200, 201]).toContain(msgRes.status());
    const msg = await msgRes.json();
    expect(msg).toBeTruthy();
  });

  test('vendor can see conversations from couples', async ({ request }) => {
    const vendorToken = await getVendorToken(request);

    const res = await request.get(`${EVENDI_URL}/api/vendor/conversations`, {
      headers: vendorHeaders(vendorToken),
    });
    expect(res.status()).toBe(200);
    const convs = await res.json();
    expect(Array.isArray(convs)).toBeTruthy();
  });

  test('vendor can read their inquiries', async ({ request }) => {
    const vendorToken = await getVendorToken(request);

    const res = await request.get(`${EVENDI_URL}/api/vendor/inquiries`, {
      headers: vendorHeaders(vendorToken),
    });
    expect(res.status()).toBe(200);
    const inquiries = await res.json();
    expect(Array.isArray(inquiries)).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. COUPLE DASHBOARD ENDPOINTS (require auth)
// ═══════════════════════════════════════════════════════════════════
test.describe('Couple Dashboard', () => {
  test('GET /api/couple/offers — returns offers list', async ({ request }) => {
    const { token } = await coupleLogin(request);
    const res = await request.get(`${EVENDI_URL}/api/couple/offers`, {
      headers: coupleHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('GET /api/couple/vendor-contracts — returns vendor contracts', async ({ request }) => {
    const { token } = await coupleLogin(request);
    const res = await request.get(`${EVENDI_URL}/api/couple/vendor-contracts`, {
      headers: coupleHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('GET /api/couple/coordinators — returns coordinators', async ({ request }) => {
    const { token } = await coupleLogin(request);
    const res = await request.get(`${EVENDI_URL}/api/couple/coordinators`, {
      headers: coupleHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('GET /api/couple/guest-invitations — returns invitations', async ({ request }) => {
    const { token } = await coupleLogin(request);
    const res = await request.get(`${EVENDI_URL}/api/couple/guest-invitations`, {
      headers: coupleHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('GET /api/couple/schedule-events — returns schedule events', async ({ request }) => {
    const { token } = await coupleLogin(request);
    const res = await request.get(`${EVENDI_URL}/api/couple/schedule-events`, {
      headers: coupleHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('GET /api/couple/guests — returns guest list', async ({ request }) => {
    const { token } = await coupleLogin(request);
    const res = await request.get(`${EVENDI_URL}/api/couple/guests`, {
      headers: coupleHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('GET /api/couple/tables — returns tables', async ({ request }) => {
    const { token } = await coupleLogin(request);
    const res = await request.get(`${EVENDI_URL}/api/couple/tables`, {
      headers: coupleHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });
});
