import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kabtlwwkfjjnrwxkfspd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthYnRsd3drZmpqbnJ3eGtmc3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NDUwMzEsImV4cCI6MjA1NzQyMTAzMX0.aQFRSGMzXwbhucrpV67SNT6nlC7n2P3wGjWPfD5hG9I'

export const supabase = createClient(supabaseUrl, supabaseKey) 