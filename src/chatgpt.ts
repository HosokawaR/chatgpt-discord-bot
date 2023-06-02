import { ChatGPTAPI } from "chatgpt";
import {
	CURRENCY_UNIT,
	EXCHANGE_RATE,
	MAX_TOKENS,
	MODEL,
	OPENAI_API_KEY,
	SYSTEM_PROMPT,
	TOKEN_UNIT_PRICE,
} from "./env.js";
import { addSystemMessage } from "./utls.js";

export type MessageWithRole = {
	message: string;
	role: string;
};

const chatgpt = new ChatGPTAPI({
	apiKey: OPENAI_API_KEY,
	completionParams: {
		model: MODEL,
		max_tokens: MAX_TOKENS,
	},
});

export const talkToChatgpt = async (
	contexts: MessageWithRole[],
): Promise<string> => {
	const context = contexts
		.map((context) => {
			return `${context.role}: ${context.message}`;
		})
		.join("\n");
	const message = `${SYSTEM_PROMPT}\n${context}\nYou:`;
	const response = await chatgpt.sendMessage(message, {
		timeoutMs: 60 * 1000,
	});
	return addCostToMessage(response.text, response.detail.usage.total_tokens);
};

const addCostToMessage = (message: string, tokenAmount: number): string => {
	const dollerCost = tokenAmount * TOKEN_UNIT_PRICE;
	const exchangedCost = dollerCost * EXCHANGE_RATE;
	const costDisplay = `$${dollerCost.toFixed(4)} (${exchangedCost.toFixed(
		4,
	)} ${CURRENCY_UNIT})`;
	return addSystemMessage(message, costDisplay);
};
