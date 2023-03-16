import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	return { conversationuid: params.conversationuid };
}) satisfies PageLoad;
