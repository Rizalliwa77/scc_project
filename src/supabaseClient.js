import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gifghqjzhucdsvdyneph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZmdocWp6aHVjZHN2ZHluZXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNTIzMzcsImV4cCI6MjA1NjkyODMzN30.eKf6bShdZKuym2GQDJeRFagiyafMq5lczHLiQoaUvMw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});