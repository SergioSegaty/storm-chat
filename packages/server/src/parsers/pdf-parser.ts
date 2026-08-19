import { PDFParse } from 'pdf-parse';
import type { DocumentParser, ParsedDocument } from './types';

export const pdfParser: DocumentParser = {
	supports(filename) {
		return filename.toLocaleLowerCase().endsWith('.pdf');
	},

	async parse(buffer, filename): Promise<ParsedDocument> {
		const parser = new PDFParse({ data: buffer });
		const result = await parser.getText();

		return {
			text: result.text,
			metadata: { source: filename, pageCount: result.pages?.length },
		};
	},
};
