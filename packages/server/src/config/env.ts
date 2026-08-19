import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PORT: z.coerce.number().default(3000),
	ANTHROPIC_API_KEY: z.string().min(1, 'Anthropic API key is required.'),
	VOYAGE_API_KEY: z.string().min(1, 'Voyage API key is required.'),
	SUPABASE_URL: z.url(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
	FRONTEND_URL: z.url().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
