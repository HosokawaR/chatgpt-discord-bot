import {
	CONSIDERD_CHAR_LIMIT,
	CURRENCY_UNIT,
	EXCHANGE_RATE,
	MODEL,
	MODEL_FOR_SEARCH,
	OPENAI_API_KEY,
	SYSTEM_PROMPT,
	TOKEN_UNIT_PRICE,
} from "./env.js";
import { search } from "./search.js";
import { addSystemMessage } from "./utls.js";
import {
	ChatCompletionFunctions,
	ChatCompletionRequestMessage,
	Configuration,
	OpenAIApi,
} from "openai";

export type Contexts = {
	content: string;
	role: "user" | "assistant";
	name: string;
};

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const REQUEST_TIMEOUT = 60 * 1000; // (ms)

export const talkToChatgpt = async (
	contexts: Contexts[],
	useSearch: boolean,
): Promise<string> => {
	let totalTokens = 0;
	const response = await openai.createChatCompletion(
		{
			model: useSearch ? MODEL_FOR_SEARCH : MODEL,
			messages: adaptMessages(contexts),
			functions,
			function_call: useSearch ? "auto" : "none",
		},
		{
			timeout: REQUEST_TIMEOUT,
		},
	);
	const message = response.data.choices[0].message;
	totalTokens += response.data.usage.total_tokens;

	if (!message.function_call) {
		const replyWithCost = addCostToMessage(message.content, totalTokens);
		return replyWithCost;
	}

	const functionName = message.function_call.name;
	const parameters = JSON.parse(message.function_call.arguments);
	const searchResult = await searchOnGoogle(parameters["search_term"]);

	const secondResponse = await openai.createChatCompletion(
		{
			model: MODEL,
			messages: adaptMessages([
				...contexts,
				message,
				{
					role: "function",
					name: functionName,
					content: searchResult,
				},
			]),
		},
		{
			timeout: REQUEST_TIMEOUT,
		},
	);
	totalTokens += secondResponse.data.usage.total_tokens;

	const replyWithCost = addCostToMessage(
		secondResponse.data.choices[0].message.content,
		totalTokens,
	);
	console.log(replyWithCost);
	// Discord does not support markdown link
	const replyWithCostWithoutMarkdownLink = replyWithCost.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		" $2 ",
	);
	return replyWithCostWithoutMarkdownLink;
};

const adaptMessages = (
	contexts: ChatCompletionRequestMessage[],
): ChatCompletionRequestMessage[] => {
	const limitedRecentContexts = contexts.reduceRight((acc, cur) => {
		if (acc.length >= CONSIDERD_CHAR_LIMIT) return acc;
		acc.unshift(cur);
		return acc;
	}, [] as ChatCompletionRequestMessage[]);

	const messages: ChatCompletionRequestMessage[] = [
		{
			role: "system",
			name: "system",
			content: SYSTEM_PROMPT,
		},
		...limitedRecentContexts,
	];

	return messages;
};

const addCostToMessage = (message: string, tokenAmount: number): string => {
	const dollerCost = tokenAmount * TOKEN_UNIT_PRICE;
	const exchangedCost = dollerCost * EXCHANGE_RATE;
	const costDisplay = `$${dollerCost.toFixed(4)} (${exchangedCost.toFixed(
		4,
	)} ${CURRENCY_UNIT})`;
	return addSystemMessage(message, costDisplay);
};

const functions: ChatCompletionFunctions[] = [
	{
		name: "search_on_google",
		description: "Search on google and fetch the first result page content",
		parameters: {
			type: "object",
			properties: {
				search_term: {
					type: "string",
					description: "The search term to search on google",
				},
			},
		},
	},
];

const searchOnGoogle = async (searchTerm: string): Promise<string> => {
	return await search(searchTerm);
};
