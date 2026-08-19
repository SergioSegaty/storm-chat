import { supabase } from '#server/lib/supabase';
import { embedTexts } from '#server/lib/embed';

export interface RetrievedChunk {
	id: number;
	content: string;
	metadata: Record<string, unknown>;
	similarity: number;
}

export async function searchChunks(
	query: string,
	matchCount = 5,
): Promise<RetrievedChunk[]> {
	const [queryEmbedding] = await embedTexts([query], 'query');

	const { data, error } = await supabase.rpc('match_documents', {
		query_embedding: queryEmbedding,
		match_count: matchCount,
	});

	if (error) {
		throw new Error(`Search failed: ${error.message}`);
	}

	return data ?? [];
}
