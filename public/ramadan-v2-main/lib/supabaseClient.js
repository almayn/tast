import { createClient } from '@supabase/supabase-js';

// استيراد بيانات الاتصال من ملف .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);