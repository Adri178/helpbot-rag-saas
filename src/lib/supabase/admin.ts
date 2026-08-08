import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Service-role Supabase client — bypasses RLS entirely. Server-only, and
 * only for the public widget endpoint, which has no user session to scope
 * RLS to. Every query made with this client MUST filter explicitly by
 * chatbot_id in application code; there is no RLS safety net here.
 *
 * Never import this from a Client Component or anything that ships to the
 * browser — the service role key must never leave the server.
 */
export function createAdminClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set"
      );
    }
    client = createSupabaseClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}
