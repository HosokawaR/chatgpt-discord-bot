import { TextChannel } from "discord.js";
import { Contexts } from "./chatgpt.js";
import { CONSIDERD_MESSAGES_LIMIT } from "./env.js";

export const getRecentLimitedMessages = async (
	channel: TextChannel,
): Promise<Contexts[]> => {
	const recentMessages = await channel.messages.fetch({
		limit: CONSIDERD_MESSAGES_LIMIT,
	});

	const reversedMessages = recentMessages.reverse();

	const messageWithoutSystemMessage: Contexts[] = reversedMessages.map(
		(message) => {
			return {
				role: message.author.bot ? "assistant" : "user",
				name: extractValidCharAsName(message.author.globalName ?? message.author.username),
				content: removeSystemMessage(message.content),
			};
		},
	);
	return messageWithoutSystemMessage;
};

const extractValidCharAsName = (name: string | undefined): string => {
	// Ref: https://platform.openai.com/docs/api-reference/chat/create#chat/create-name
	return name?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "unknown";
};

export const addSystemMessage = (messaeg: string, cost: string): string => {
	return `${messaeg}\nCost: ${cost}`;
};

export const removeSystemMessage = (messaeg: string): string => {
	return messaeg.replace(/Cost: .*/, "");
};

export class TypingSender {
	private channel: TextChannel;
	private interval: NodeJS.Timeout | null = null;
	private intervalTime = 1000;

	constructor(channel: TextChannel) {
		this.channel = channel;
	}

	async start() {
		await this.channel.sendTyping();
		this.interval = setInterval(async () => {
			await this.channel.sendTyping();
		}, this.intervalTime);
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval);
		}
	}
}

type Func = () => Promise<void>;
type onError = (error: any, attemptsCount: number) => Promise<boolean>;
type onRetryExhausted = (error: any) => Promise<void>;

export const retry = async (
	func: Func,
	onError: onError,
	onRetryExhausted: onRetryExhausted,
	maxAttemptsTime = 5,
) => {
	let attempts = 0;

	const execute = async () => {
		attempts += 1;
		try {
			await func();
		} catch (error) {
			const shouldRetry = await onError(error, attempts);
			if (shouldRetry && attempts <= maxAttemptsTime) {
				await sleep(5000);
				await execute();
			} else if (shouldRetry) {
				await onRetryExhausted(error);
			}
		}
	};

	await execute();
};

const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
