import { env } from '#server/config/env';
import { createClient } from '@supabase/supabase-js';
import { Database } from 'shared';

export const supabase = createClient<Database>(
	env.SUPABASE_URL,
	env.SUPABASE_SERVICE_ROLE_KEY,
);
