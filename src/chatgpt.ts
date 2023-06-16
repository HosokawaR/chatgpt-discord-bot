import {
	CURRENCY_UNIT,
	EXCHANGE_RATE,
	MAX_TOKENS,
	MODEL,
	OPENAI_API_KEY,
	TOKEN_UNIT_PRICE,
} from "./env.js";
import { addSystemMessage } from "./utls.js";
import { Configuration, OpenAIApi } from "openai";

export type Contexts = {
	message: string;
	role: "user" | "system";
	name: string;
};

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const talkToChatgpt = async (contexts: Contexts[]): Promise<string> => {
	const messages = contexts.map((context) => ({
		role: context.role,
		content: context.message,
		name: context.name,
	}));
	const response = await openai.createChatCompletion({
		model: MODEL,
		max_tokens: MAX_TOKENS,
		messages,
	});
	const replyWithCost = addCostToMessage(
		response.data.choices[0].message.content,
		response.data.usage.total_tokens,
	);
	return replyWithCost;
};

const addCostToMessage = (message: string, tokenAmount: number): string => {
	const dollerCost = tokenAmount * TOKEN_UNIT_PRICE;
	const exchangedCost = dollerCost * EXCHANGE_RATE;
	const costDisplay = `$${dollerCost.toFixed(4)} (${exchangedCost.toFixed(
		4,
	)} ${CURRENCY_UNIT})`;
	return addSystemMessage(message, costDisplay);
};
