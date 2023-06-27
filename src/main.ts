import { Client, Message, TextChannel } from "discord.js";
import { DISCORD_TOKEN } from "./env.js";
import { getRecentLimitedMessages, retry, TypingSender } from "./utls.js";
import { talkToChatgpt } from "./chatgpt.js";

const client = new Client({
	intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"],
});

client.on("ready", () => {
	console.log(`Bot has started as: ${client.user?.tag}`);
});

client.login(DISCORD_TOKEN);

const ENABLE_SEARCH_WORDS = ["検索", "調べて", "search", "google"];

client.on("messageCreate", async (message: Message) => {
	if (message.author.bot) return;
	if (!(message.channel instanceof TextChannel)) return;

	if (message.mentions.users.has(client.user?.id)) {
		const typingSender = new TypingSender(message.channel);
		await typingSender.start();

		const contexts = await getRecentLimitedMessages(message.channel);

		// WORKAROUND
		// Because OpenAI's API frequently returns 500 status when including search results
		// allow to explicitly enable search
		const useSearch = ENABLE_SEARCH_WORDS.some((word) =>
			message.content.includes(word),
		);

		let retryingMessage: Message | undefined = undefined;

		await retry(
			async () => {
				const response = await talkToChatgpt(contexts, useSearch);
				message.channel.send(response);
			},
			async (error, attemptsCount) => {
				const statusCode = error?.response?.request?.res?.statusCode;
				if (!statusCode || (500 <= statusCode && statusCode < 600)) {
					if (!retryingMessage) {
						retryingMessage = await message.channel.send(
							`Please wait. OpenAI API Error occured. Now Retrying... ${attemptsCount} time`,
						);
					} else {
						await retryingMessage.edit(
							`Please wait. OpenAI API Error occured. Now Retrying... ${attemptsCount} times`,
						);
					}
					return true;
				}
				const errorMessage = error?.response?.data?.error?.message;
				message.channel.send(`OpenAI API Error\n${errorMessage ?? ""}`);
				return false;
			},
			async (error) => {
				if (retryingMessage) {
					await retryingMessage.edit(
						"OpenAI API Error occured. All Retry failed.",
					);
				}
			},
		);

		typingSender.stop();
	}
});
