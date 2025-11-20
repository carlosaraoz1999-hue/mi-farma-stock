import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://psptaeipuxysqbuqbotq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcHRhZWlwdXh5c3FidXFib3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTk4MjcsImV4cCI6MjA3OTAzNTgyN30.6nV2c_IBDKdL13YN1IBQ11Kga4obLxHf8Z8fUKFWFhE'

export const supabase = createClient(supabaseUrl, supabaseKey)