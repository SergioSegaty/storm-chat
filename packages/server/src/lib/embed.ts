import { env } from '#server/config/env';
import { VoyageAIClient } from 'voyageai';

const voyage = new VoyageAIClient({ apiKey: env.VOYAGE_API_KEY });

export async function embedTexts(
	texts: string[],
	inputType: 'document' | 'query' = 'document',
): Promise<number[][]> {
	const res = await voyage.embed({
		input: texts,
		model: 'voyage-4-lite',
		inputType,
		outputDimension: 512,
	});

	const embeddings = res.data
		?.map((d) => d.embedding)
		.filter((e): e is number[] => !!e);

	if (!embeddings || embeddings.length !== texts.length) {
		throw new Error('Embedding count mismatch');
	}

	return embeddings;
}
