import { ClientUser, TextChannel } from "discord.js";
import { MessageWithRole } from "./chatgpt.js";

const CONSIDERD_MESSAGES_LIMIT = 10;
const CONSIDERD_CHAR_LIMIT = 1000;

export class MessageTooLongError extends Error {
	readonly name = "MessageTooLongError";
}

export const getRecentLimitedMessages = async (
	channel: TextChannel,
	botUser: ClientUser,
): Promise<MessageWithRole[] | MessageTooLongError> => {
	const recentMessages = await channel.messages.fetch({
		limit: CONSIDERD_MESSAGES_LIMIT,
	});
	const limitedMessages = recentMessages.reduce(
		(acc: MessageWithRole[], message) => {
			if (message.content.length < CONSIDERD_CHAR_LIMIT) {
				const roleName =
					message.member.id === botUser.id
						? "You"
						: message.member?.displayName || "unknown";
				acc.push({
					message: message.content,
					role: roleName,
				});
			}
			return acc;
		},
		[],
	);

	if (limitedMessages.length === 0) {
		return new MessageTooLongError(
			`No message is less than ${CONSIDERD_CHAR_LIMIT} characters.`,
		);
	}

	const reversedMessages = limitedMessages.reverse();
	const messageWithoutSystemMessage = reversedMessages.map((message) => {
		return {
			message: removeSystemMessage(message.message),
			role: message.role,
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
