import { createClient } from '@supabase/supabase-js';

// Environment variables'dan Supabase bağlantı bilgilerini alıyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// API anahtarlarının varlığını kontrol ediyoruz
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key tanımlanmalıdır!');
}

/**
 * Supabase istemcisini oluşturuyoruz.
 * Bu istemci veritabanı işlemleri, kimlik doğrulama ve gerçek zamanlı (realtime) abonelikler için kullanılır.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Oturumun otomatik yenilenmesini sağlar
    persistSession: true,   // Oturumun tarayıcıda (localStorage) saklanmasını sağlar
    detectSessionInUrl: true // URL'deki (e-posta doğrulama vb.) oturum bilgilerini yakalar
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // Realtime kanalındaki event hızı sınırı
    }
  }
});
