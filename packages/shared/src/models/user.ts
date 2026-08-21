import { z } from 'zod';

export const userRegistrationSchema = z.object({
	email: z.email({ error: 'Invalid email.' }),
	password: z.string('Password is required'),
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;

export type LoginInput = Pick<UserRegistration, 'email' | 'password'>;
