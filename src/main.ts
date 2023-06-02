import { Client, Message, TextChannel } from "discord.js";
import { DISCORD_TOKEN } from "./env.js";
import {
	MessageTooLongError,
	TypingSender,
	getRecentLimitedMessages,
} from "./utls.js";
import { takeToChatgpt } from "./chatgpt.js";

const client = new Client({
	intents: ["Guilds", "GuildMessages", "MessageContent"],
});

client.on("ready", () => {
	console.log(`Bot has started as: ${client.user?.tag}`);
});

client.login(DISCORD_TOKEN);

client.on("messageCreate", async (message: Message) => {
	if (message.author.bot) return;
	if (!(message.channel instanceof TextChannel)) return;

	if (message.mentions.users.has(client.user?.id)) {
		await message.channel.sendTyping();
		const typingSender = new TypingSender(message.channel);
		await typingSender.start();
		const contexts = await getRecentLimitedMessages(
			message.channel,
			client.user,
		);
		if (contexts instanceof MessageTooLongError) {
			message.channel.send(contexts.message);
			return;
		}
		const response = await takeToChatgpt(contexts);
		typingSender.stop();
		message.channel.send(response);
	}
});

client.login(process.env.DISCORD_TOKEN);
