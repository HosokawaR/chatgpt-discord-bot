import { Client, Message, TextChannel } from "discord.js";
import { DISCORD_TOKEN } from "./env.js";
import { getRecentLimitedMessages, TypingSender } from "./utls.js";
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

		try {
			const response = await talkToChatgpt(contexts);
			message.channel.send(response);
		} catch (error) {
			message.channel.send(
				`OpenAI API Error\n${error.response.data.error.message}`,
			);
		} finally {
			typingSender.stop();
		}
	}
});
