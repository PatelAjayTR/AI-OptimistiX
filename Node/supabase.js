const createClient = require('@supabase/supabase-js')

export const supabase = createClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: {
        persistSession: false
    }
});
