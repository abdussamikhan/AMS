import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

const supabaseUrl = 'https://mudwzlkknwqrvppkorgx.supabase.co'
const supabaseAnonKey = 'sb_publishable_8wSjbxRiXDuUQHsx5CQZFQ_PBIyqXSm'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
