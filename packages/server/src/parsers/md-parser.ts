import matter from 'gray-matter';
import type { DocumentParser, ParsedDocument } from './types';

export const markdownParser: DocumentParser = {
	supports(filename) {
		return filename.toLocaleLowerCase().endsWith('.md');
	},

	async parse(buffer, filename): Promise<ParsedDocument> {
		const { content, data } = matter(buffer.toString('utf-8'));

		return {
			text: content,
			metadata: { source: filename, title: data.title, ...data },
		};
	},
};
