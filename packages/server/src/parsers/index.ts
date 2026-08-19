import { pdfParser } from './pdf-parser';
import { markdownParser } from './md-parser';
import type { ParsedDocument } from './types';
import { AppError } from '#server/middleware/error-handler';

const parsers = [pdfParser, markdownParser];

export async function parseDocument(
	buffer: Buffer,
	filename: string,
): Promise<ParsedDocument> {
	const parser = parsers.find((p) => p.supports(filename));

	if (!parser) {
		throw new AppError(400, `Unsuported file type: ${filename}`);
	}

	return parser.parse(buffer, filename);
}
