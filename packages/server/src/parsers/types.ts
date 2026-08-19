export interface ParsedDocument {
	text: string;
	metadata: {
		source: string;
		title?: string;
		[key: string]: unknown;
	};
}

export interface DocumentParser {
	supports(filename: string): boolean;
	parse(buffer: Buffer, filename: string): Promise<ParsedDocument>;
}
