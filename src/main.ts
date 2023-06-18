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

client.on("messageCreate", async (message: Message) => {
	if (message.author.bot) return;
	if (!(message.channel instanceof TextChannel)) return;

	if (message.mentions.users.has(client.user?.id)) {
		const typingSender = new TypingSender(message.channel);
		await typingSender.start();

		const contexts = await getRecentLimitedMessages(message.channel);

		let retryingMessage: Message | undefined = undefined;

		await retry(
			async () => {
				const response = await talkToChatgpt(contexts);
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
				message.channel.send(
					`OpenAI API Error\n${error.response.data.error.message}`,
				);
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
