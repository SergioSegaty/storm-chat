import { AppError } from '#server/middleware/error-handler';
import { Router } from 'express';
import multer from 'multer';
import { chunkText } from '#server/lib/chunk';
import { embedTexts } from '#server/lib/embed';
import { supabase } from '#server/lib/supabase';
import { parseDocument } from '../parsers';

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const ingestRouter: Router = Router();

ingestRouter.post(
	'/',
	upload.single('file'),
	async (req, res, next) => {
		try {
			if (!req.file) {
				throw new AppError(400, 'No file uploaded');
			}

			const { buffer, originalname } = req.file;

			const parsed = await parseDocument(buffer, originalname);
			const chunks = chunkText(parsed.text, parsed.metadata);

			if (chunks.length === 0) {
				throw new AppError(400, 'No extractable text found in file');
			}

			const embeddings = await embedTexts(chunks.map((c) => c.text));

			const rows = chunks.map((chunk, i) => ({
				content: chunk.text,
				metadata: chunk.metadata,
				embedding: embeddings[i],
			}));

			const { error } = await supabase.from('documents').insert(rows);

			if (error) {
				throw new AppError(
					500,
					`Failed to store chunks: ${error.message}`,
				);
			}

			res.json({ filename: originalname, chunksIndexed: chunks.length });
		} catch (err) {
			next(err);
		}
	},
);
