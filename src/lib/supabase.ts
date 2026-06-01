import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getInstance(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
        global: {
          fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
        },
      }
    )
  }
  return _client
}

// Lazy proxy — client is created on first access at request time, not at build time.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    return Reflect.get(getInstance(), prop)
  },
})
