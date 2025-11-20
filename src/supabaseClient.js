import { createClient } from '@supabase/supabase-js'

// En Vite, las variables se leen así: import.meta.env.NOMBRE_VARIABLE
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)