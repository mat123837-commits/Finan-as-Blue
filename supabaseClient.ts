import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bxidmdzdgemolyyikfzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aWRtZHpkZ2Vtb2x5eWlrZnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTczMDcsImV4cCI6MjA4MTQ3MzMwN30.StDRpOyO_qFUN1-OXqIB5DNDxeTfGIR9R7Wl5SiUEzc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});