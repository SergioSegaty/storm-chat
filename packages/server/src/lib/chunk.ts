interface Chunk {
	text: string;
	metadata: Record<string, unknown>;
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export function chunkText(
	text: string,
	baseMetadata: Record<string, unknown>,
): Chunk[] {
	const chunks: Chunk[] = [];
	let start = 0;

	while (start < text.length) {
		const end = Math.min(start + CHUNK_SIZE, text.length);
		const slice = text.slice(start, end).trim();

		if (slice.length > 0) {
			chunks.push({ text: slice, metadata: baseMetadata });
		}

		start += CHUNK_SIZE - CHUNK_OVERLAP;
	}

	return chunks;
}
