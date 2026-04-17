const { createClient } = require('@supabase/supabase-js');

// Cliente con service role key para operaciones del servidor (sin restricciones de RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
