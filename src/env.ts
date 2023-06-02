const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not defined");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
if (!DISCORD_TOKEN) throw new Error("DISCORD_TOKEN is not defined");

const MAX_TOKENS = Number(process.env.MAX_TOKENS) || 1000;

const MODEL = process.env.MODEL || "gpt-3.5-turbo";

//Ref: https://openai.com/pricing
const TOKEN_UNIT_PRICE = Number(process.env.TOKEN_UNIT_PRICE) || 0.002 / 1000;

const EXCHANGE_RATE = Number(process.env.EXCHANGE_RATE) || 1;

const CURRENCY_UNIT = process.env.CURRENCY_UNIT || "USD";

const SYSTEM_PROMPT =
	process.env.SYSTEM_PROMPT || "Reply to the following message:";

export {
	CURRENCY_UNIT,
	DISCORD_TOKEN,
	EXCHANGE_RATE,
	MAX_TOKENS,
	MODEL,
	OPENAI_API_KEY,
	SYSTEM_PROMPT,
	TOKEN_UNIT_PRICE,
};
