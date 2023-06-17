const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not defined");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
if (!DISCORD_TOKEN) throw new Error("DISCORD_TOKEN is not defined");

const MODEL = process.env.MODEL || "gpt-3.5-turbo-16k-0613";

//Ref: https://openai.com/pricing
const TOKEN_UNIT_PRICE = Number(process.env.TOKEN_UNIT_PRICE) || 0.003 / 1000;

const EXCHANGE_RATE = Number(process.env.EXCHANGE_RATE) || 1;

const CURRENCY_UNIT = process.env.CURRENCY_UNIT || "USD";

const SYSTEM_PROMPT =
	process.env.SYSTEM_PROMPT ||
	"When searching, please specify the URL of the page you referred to.";

const CONSIDERD_MESSAGES_LIMIT =
	Number(process.env.CONSIDERD_MESSAGES_LIMIT) || 5;

const CONSIDERD_CHAR_LIMIT = Number(process.env.CONSIDERD_CHAR_LIMIT) || 2000;

const GCP_SEARCH_API_KEY = process.env.GCP_SEARCH_API_KEY;

const GOOGLE_CUSTOM_SEARCH_CX = process.env.GOOGLE_CUSTOM_SEARCH_CX;

export {
	CURRENCY_UNIT,
	DISCORD_TOKEN,
	EXCHANGE_RATE,
	MODEL,
	OPENAI_API_KEY,
	SYSTEM_PROMPT,
	TOKEN_UNIT_PRICE,
	CONSIDERD_CHAR_LIMIT,
	CONSIDERD_MESSAGES_LIMIT,
	GCP_SEARCH_API_KEY,
	GOOGLE_CUSTOM_SEARCH_CX,
};
