import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  // Gunakan globalThis agar instance bertahan dari Fast Refresh Next.js
  if (!globalThis.supabaseBrowserClient) {
    globalThis.supabaseBrowserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          // Bypass internal lock to completely eliminate "stuck" race conditions
          // The function signature must be (name, acquireTimeout, fn)
          lock: async (name, acquireTimeout, fn) => {
            return await fn();
          }
        }
      }
    );
  }

  return globalThis.supabaseBrowserClient;
}