import { Router } from 'express';
import {
	convertToModelMessages,
	pipeUIMessageStreamToResponse,
	streamText,
	toUIMessageStream,
} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
	asyncHandler,
	AppError,
} from '#server/middleware/error-handler';
import { searchChunks } from '#server/lib/search';
import { chatRequestSchema } from 'shared';
import { flatRetrievedChunk } from '#server/lib/chunk';

export const chatRouter: Router = Router();

chatRouter.post(
	'/',
	asyncHandler(async (req, res) => {
		const { messages } = await chatRequestSchema.parseAsync(req.body);
		const lastMessage = messages.at(-1);

		if (!lastMessage || lastMessage.role !== 'user') {
			throw new AppError(400, 'Last message must be from user');
		}

		const lastPart = lastMessage.parts.at(-1);

		if (lastPart?.type != 'text') {
			throw new AppError(400, 'Last message part must be a text');
		}

		const retrieved = await searchChunks(lastPart.text);

		const context = flatRetrievedChunk(retrieved);

		const result = streamText({
			model: anthropic('claude-sonnet-4-6'),
			system: `You answer questions using only the provided context below. If the answer isn't in the context, say you dont know - don't make anything up \n\nContext:\n${context || '(no relevant context found)'}`,
			messages: await convertToModelMessages(messages),
		});

		await pipeUIMessageStreamToResponse({
			response: res,
			stream: toUIMessageStream({
				stream: result.stream,
				originalMessages: messages,
			}),
		});
	}),
);
