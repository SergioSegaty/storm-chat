import { UIMessage } from 'ai';
import z from 'zod';

export const chatRequestSchema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string(),
				id: z.string(),
				parts: z.array(
					z.object({
						type: z.string(),
						text: z.string(),
					}),
				),
			}),
		)
		.min(1),
});

export const partSchema = z.object({
	type: z.string(),
	text: z.string(),
});

type CustomParts = z.infer<typeof partSchema>;
export type ChatUiMessage = UIMessage<never, CustomParts, never>;
