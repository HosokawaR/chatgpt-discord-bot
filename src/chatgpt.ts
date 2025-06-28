import {
	CONSIDERD_CHAR_LIMIT,
	CURRENCY_UNIT,
	EXCHANGE_RATE,
	MODEL,
	OPENAI_API_KEY,
	SYSTEM_PROMPT,
	INPUT_TOKEN_PRICE_PER_1M,
	OUTPUT_TOKEN_PRICE_PER_1M,
	SEARCH_CONTEXT_SIZE,
} from "./env.js";
import { addSystemMessage } from "./utls.js";
import OpenAI from "openai";


export type Contexts = {
	content: string;
	role: "user" | "assistant";
	name: string;
};

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

const REQUEST_TIMEOUT = 60 * 1000; // (ms)

export const talkToChatgpt = async (
	contexts: Contexts[],
): Promise<string> => {
	const messages = adaptMessages(contexts);
	
	// Use OpenAI's web search with configuration
	const config: any = {
		model: MODEL,
		messages: messages,
		web_search_options: {
			search_context_size: SEARCH_CONTEXT_SIZE
		}
	};

	const response = await openai.chat.completions.create(config, {
		timeout: REQUEST_TIMEOUT,
	});
	console.log(JSON.stringify(response, null, 2));
	
	const inputTokens = response.usage?.prompt_tokens || 0;
	const outputTokens = response.usage?.completion_tokens || 0;
	
	const replyWithCost = addCostToMessage(
		response.choices[0].message.content || "",
		inputTokens,
		outputTokens,
	);
	// Discord does not support markdown link
	const replyWithCostWithoutMarkdownLink = replyWithCost.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		" $2 ",
	);
	return replyWithCostWithoutMarkdownLink;
};

const adaptMessages = (
	contexts: OpenAI.Chat.ChatCompletionMessageParam[],
): OpenAI.Chat.ChatCompletionMessageParam[] => {
	const limitedRecentContexts = contexts.reduceRight((acc, cur) => {
		if (acc.length >= CONSIDERD_CHAR_LIMIT) return acc;
		acc.unshift(cur);
		return acc;
	}, [] as OpenAI.Chat.ChatCompletionMessageParam[]);

	const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
		{
			role: "system",
			content: SYSTEM_PROMPT,
		},
		...limitedRecentContexts,
	];

	return messages;
};

const addCostToMessage = (message: string, inputTokens: number, outputTokens: number): string => {
	const inputCost = (inputTokens / 1000000) * INPUT_TOKEN_PRICE_PER_1M;
	const outputCost = (outputTokens / 1000000) * OUTPUT_TOKEN_PRICE_PER_1M;
	const totalCost = inputCost + outputCost;
	const exchangedCost = totalCost * EXCHANGE_RATE;
	const costDisplay = `$${totalCost.toFixed(2)} (${exchangedCost.toFixed(
		2,
	)} ${CURRENCY_UNIT})`;
	return addSystemMessage(message, costDisplay);
};

