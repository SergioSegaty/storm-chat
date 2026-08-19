import type {
	Request,
	Response,
	NextFunction,
	RequestHandler,
} from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
	constructor(
		public statusCode: number,
		message: string,
	) {
		super(message);
		this.name = 'AppError';
	}
}

export function asyncHandler(fn: RequestHandler): RequestHandler {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

export function notFoundHandler(req: Request, res: Response) {
	res
		.status(404)
		.json({ error: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({ error: err.message });
	}

	if (err instanceof ZodError) {
		return res.status(400).json({
			error: 'Validation failed',
			details: err.issues.map((i) => ({
				path: i.path.join('.'),
				message: i.message,
			})),
		});
	}

	console.error(err);
	return res.status(500).json({ error: 'Internal server error' });
}
