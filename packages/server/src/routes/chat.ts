import { Router } from 'express';
import {
	pipeUIMessageStreamToResponse,
	streamText,
	toUIMessageStream,
} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import {
	asyncHandler,
	AppError,
} from '#server/middleware/error-handler';
import { searchChunks } from '#server/lib/search';

const chatRequestSchema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string(),
			}),
		)
		.min(1),
});

export const chatRouter: Router = Router();

chatRouter.post(
	'/',
	asyncHandler(async (req, res) => {
		const parsed = chatRequestSchema.parse(req.body);

		const { messages } = parsed;

		const lastMessage = messages[messages.length - 1];
		if (!lastMessage || lastMessage.role !== 'user') {
			throw new AppError(400, 'Last message must be from user');
		}

		const retrieved = await searchChunks(lastMessage.content);

		if (retrieved.length === 0) {
			throw new AppError(
				400,
				`No relevant documents was found for this question.`,
			);
		}

		const context = retrieved
			.map(
				(chunk, i) =>
					`[${i + 1}] (source: ${chunk.metadata.source ?? 'unknown'})\n${chunk.content}`,
			)
			.join('\n\n---\n\n');

		const result = streamText({
			model: anthropic('claude-sonnet-4-6'),
			system: `You awnser questions using only the provided context below. If the awnser isnt in the context, say you dont know - don't make anything up \n\nContext:\n${context || '(no relevant context found)'}`,
			messages,
		});

		await pipeUIMessageStreamToResponse({
			response: res,
			stream: toUIMessageStream({ stream: result.stream }),
		});
	}),
);
