const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not defined");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
if (!DISCORD_TOKEN) throw new Error("DISCORD_TOKEN is not defined");

const MODEL = process.env.MODEL || "gpt-4o";

//Ref: https://openai.com/pricing
const INPUT_TOKEN_PRICE_PER_1M = Number(process.env.INPUT_TOKEN_PRICE_PER_1M) || 2.5;
const OUTPUT_TOKEN_PRICE_PER_1M = Number(process.env.OUTPUT_TOKEN_PRICE_PER_1M) || 10.0;

const EXCHANGE_RATE = Number(process.env.EXCHANGE_RATE) || 1;

const CURRENCY_UNIT = process.env.CURRENCY_UNIT || "USD";

const SYSTEM_PROMPT =
	process.env.SYSTEM_PROMPT ||
	"You are a helpful assistant.";

const CONSIDERD_MESSAGES_LIMIT =
	Number(process.env.CONSIDERD_MESSAGES_LIMIT) || 20;

const CONSIDERD_CHAR_LIMIT = Number(process.env.CONSIDERD_CHAR_LIMIT) || 2000;

// high, medium, low
const SEARCH_CONTEXT_SIZE = process.env.SEARCH_CONTEXT_SIZE || "medium"; 

export {
	CURRENCY_UNIT,
	DISCORD_TOKEN,
	EXCHANGE_RATE,
	MODEL,
	OPENAI_API_KEY,
	SYSTEM_PROMPT,
	INPUT_TOKEN_PRICE_PER_1M,
	OUTPUT_TOKEN_PRICE_PER_1M,
	CONSIDERD_CHAR_LIMIT,
	CONSIDERD_MESSAGES_LIMIT,
	SEARCH_CONTEXT_SIZE,
};
