import { createClient } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Use singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
}

// Export default instance for immediate use
export const supabase = getSupabaseClient();

// Configure redirect URL for OAuth
WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: "exp",
    });

    console.log("OAuth Redirect URL:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error("Google OAuth error:", error);
      throw error;
    }

    if (data.url) {
      // Open the OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === "success") {
        // Extract the URL and get session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        return sessionData.session;
      } else if (result.type === "cancel") {
        throw new Error("Google login cancelled");
      }
    }

    return null;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error) throw error;
    return sessionData.session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};
