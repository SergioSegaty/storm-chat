import { safeValidateUIMessages, UIMessage } from 'ai';
import z from 'zod';

const metadataSchema = z.object({
	timestamp: z.iso.datetime(),
});

const dataSchemas = {};

export const chatRequestSchema = z.object({
	messages: z
		.array(z.unknown())
		.min(1)
		.transform(async (messages, ctx): Promise<UIMessage[]> => {
			const result = await safeValidateUIMessages<UIMessage>({
				messages,
				metadataSchema,
				dataSchemas,
			});

			if (!result.success) {
				ctx.addIssue(result.error.message);
				return z.NEVER;
			}

			return result.data;
		}),
});
