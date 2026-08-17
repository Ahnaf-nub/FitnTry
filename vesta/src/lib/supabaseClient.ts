import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fails loudly in dev instead of a confusing runtime error deep in a
  // fetch call the first time someone hits Login.
  console.warn(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in."
  );
}

// createClient() throws synchronously on an empty/invalid URL, which would
// crash the whole module (and blank the entire app) before React ever
// renders. Fall back to a harmless placeholder so the app still loads when
// Supabase isn't configured yet — auth calls will just fail gracefully.
export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "public-anon-key");

/**
 * Supabase Auth is email/password natively. We want plain usernames, so we
 * deterministically derive a fake internal email from the username
 * (e.g. "ahnaf" -> "ahnaf@FitnTry.local") and use that everywhere instead of
 * a real email. This also gives username uniqueness for free — Supabase
 * already enforces unique emails at the auth.users level.
 *
 * Requires "Confirm email" turned OFF in Supabase Auth settings, since
 * these addresses can't receive a real confirmation email.
 */
export function usernameToEmail(username: string): string {
  const normalized = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  return `${normalized}@FitnTry.local`;
}
