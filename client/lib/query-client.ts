import { QueryClient, QueryFunction } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:5000").
 * Prefers explicit API URL, falls back to domain, and uses localhost in dev/web.
 */
export function getApiUrl(): string {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  const envDomain = process.env.EXPO_PUBLIC_DOMAIN;

  // Dev/web: if running in a browser on a local network, talk to the local API
  if (typeof window !== "undefined") {
    const host = window.location?.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    const isLanIp = /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(host || "");

    // GitHub Codespaces: use port-forwarded URL (HTTPS) instead of localhost (HTTP)
    // to avoid mixed content blocking (HTTPS page → HTTP request)
    const isGithubCodespaces = host?.includes(".app.github.dev") || host?.includes(".github.dev");
    if (isGithubCodespaces) {
      // Replace any port (8080-8089 typically) with 5000 (API server) in the hostname
      // Format is typically: scaling-computing-machine-7v64xj69rr7gfpjjw-PORT.app.github.dev
      const apiHost = host.replace(/-\d{4,5}\./, "-5000.");
      return `https://${apiHost}`;
    }

    if (isLocalhost) return "http://localhost:5000";
    if (isLanIp) return `http://${host}:5000`;
    if (envDomain && host === envDomain.replace(/^https?:\/\//, "")) {
      return `https://${host}`;
    }

    // If Cloudflare tunnel host is configured but we are on web and DNS may fail,
    // prefer local API to avoid net::ERR_NAME_NOT_RESOLVED during development.
    if (envApiUrl && envApiUrl.includes("trycloudflare.com")) {
      return "http://localhost:5000";
    }
  }

  if (envApiUrl) return envApiUrl;
  if (envDomain) return `https://${envDomain}`;

  throw new Error("No API base URL configured (set EXPO_PUBLIC_API_URL or EXPO_PUBLIC_DOMAIN)");
}

/**
 * Get the current auth token - either preview session token or regular session token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    // Check for preview session first
    const previewToken = await AsyncStorage.getItem("preview_session_token");
    if (previewToken) {
      return previewToken;
    }
    
    // Fall back to regular session token
    const token = await AsyncStorage.getItem("session_token");
    return token || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Check if we're in preview mode
 */
export async function isInPreviewMode(): Promise<boolean> {
  try {
    const previewMode = await AsyncStorage.getItem("preview_mode");
    return !!previewMode;
  } catch {
    return false;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);
  const token = await getAuthToken();

  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);
    const token = await getAuthToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
