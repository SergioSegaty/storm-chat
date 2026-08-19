import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import {
	errorHandler,
	notFoundHandler,
} from './middleware/error-handler.js';
import { ingestRouter } from './routes/ingest.js';
import { chatRouter } from './routes/chat.js';

export function createApp(): Application {
	const app = express();

	app.use(
		cors({
			origin: env.FRONTEND_URL,
			credentials: true,
		}),
	);

	app.use(express.json());

	app.get('/health', (_req, res) => {
		res.json({ status: 'ok' });
	});

	app.use('api/ingest', ingestRouter);
	app.use('api/chat', chatRouter);

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}
