import { TextChannel } from "discord.js";
import { Contexts } from "./chatgpt.js";
import { CONSIDERD_CHAR_LIMIT, CONSIDERD_MESSAGES_LIMIT } from "./env.js";

export class MessageTooLongError extends Error {
	readonly name = "MessageTooLongError";
}

export const getRecentLimitedMessages = async (
	channel: TextChannel,
): Promise<Contexts[] | MessageTooLongError> => {
	const recentMessages = await channel.messages.fetch({
		limit: CONSIDERD_MESSAGES_LIMIT,
	});
	const limitedMessages = recentMessages.reduce((acc: Contexts[], message) => {
		const total_char_count = acc.reduce(
			(acc, message) => acc + message.message.length,
			0,
		);
		if (total_char_count < CONSIDERD_CHAR_LIMIT) {
			const name = message.author.bot
				? "ChatGPT"
				: message.author.username || "unknown";
			acc.push({
				message: message.cleanContent,
				role: message.author.bot ? "system" : "user",
				name,
			});
		}
		return acc;
	}, []);

	if (limitedMessages.length === 0) {
		return new MessageTooLongError(
			`No message is less than ${CONSIDERD_CHAR_LIMIT} characters.`,
		);
	}

	const reversedMessages = limitedMessages.reverse();

	const messageWithoutSystemMessage = reversedMessages.map((message) => {
		return {
			...message,
			message: removeSystemMessage(message.message),
		};
	});
	return messageWithoutSystemMessage;
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
	private intervalTime = 5000;

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
