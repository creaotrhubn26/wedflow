/**
 * Shared test helpers for Playwright E2E API tests
 */
import { APIRequestContext } from '@playwright/test';

// ── Auth Constants ──────────────────────────────────────────────
export const ADMIN_SECRET = 'evendi-admin-2024-secure';
export const CREATORHUB_API_KEY = 'ch_555b82505031ee57075870cfb0c14db0695ee53104af274c60a3a92b0491c006';
export const CREATORHUB_USER_ID = 'admin-daniel-creatorhubn';
export const TEST_VENDOR_EMAIL = 'workflow-test@evendi.no';
export const TEST_VENDOR_PASSWORD = 'Test@1234';
export const TEST_VENDOR_ID = '807774fa-81ac-47f9-b76d-012083a57f51';
export const LINKED_VENDOR_ID = '9a66f202-6f55-4021-aaa3-c90a923f99bf';

// ── URLs ────────────────────────────────────────────────────────
export const EVENDI_URL = 'http://localhost:5000';
export const CREATORHUB_URL = 'http://localhost:3001';

// ── Auth Headers ────────────────────────────────────────────────
export function adminHeaders() {
  return { Authorization: `Bearer ${ADMIN_SECRET}` };
}

export function adminSecretHeaders() {
  return { 'x-admin-secret': ADMIN_SECRET };
}

export function bridgeHeaders() {
  return { 'x-api-key': CREATORHUB_API_KEY };
}

export function creatorhubHeaders() {
  return { 'x-user-id': CREATORHUB_USER_ID };
}

// ── Vendor Auth ─────────────────────────────────────────────────
let cachedVendorToken: string | null = null;

export async function getVendorToken(request: APIRequestContext): Promise<string> {
  if (cachedVendorToken) return cachedVendorToken;
  
  const res = await request.post(`${EVENDI_URL}/api/vendors/login`, {
    data: { email: TEST_VENDOR_EMAIL, password: TEST_VENDOR_PASSWORD },
  });
  const body = await res.json();
  cachedVendorToken = body.sessionToken || body.token;
  return cachedVendorToken!;
}

export function vendorHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── Couple Auth ─────────────────────────────────────────────────
let cachedCoupleToken: string | null = null;
let cachedCoupleId: string | null = null;

export async function getCoupleAuth(request: APIRequestContext): Promise<{ token: string; coupleId: string }> {
  if (cachedCoupleToken && cachedCoupleId) return { token: cachedCoupleToken, coupleId: cachedCoupleId };
  
  // /api/couples/login auto-registers if new, requires displayName
  const loginRes = await request.post(`${EVENDI_URL}/api/couples/login`, {
    data: { email: 'e2e-couple@evendi.no', displayName: 'E2E Couple', password: 'Test@1234' },
  });
  
  const body = await loginRes.json();
  cachedCoupleToken = body.sessionToken;
  cachedCoupleId = body.couple?.id;
  return { token: cachedCoupleToken!, coupleId: cachedCoupleId! };
}

export function coupleHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── Helpers ─────────────────────────────────────────────────────
export function expectSuccess(status: number) {
  return status >= 200 && status < 300;
}
