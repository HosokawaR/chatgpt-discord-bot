# ChatGPT Discord Bot

## How to setup

1. Copy .env.config to .env and fill in the values.
    1. `DISCORD_TOKEN` is the token for the bot. You can get this from the Discord Developer Portal.
    2. You can obtain your `OPENAI_API_KEY` at https://platform.openai.com/account/api-keys.
2. Run `docker compose --env-file .env up -d` to start the bot.

## How to use in Discord

### Basic

1. Check the authorization of SERVER MEMBERS INTENT and MESSAGE CONTENT INTENT in "Privileged Gateway Intents" of Discord Developer Portal
2. Invite the bot to your server. You can get the invite link from the Discord Developer Portal.
3. You can talk with the bot by mentioning it and typing your message.

Example  
![image](https://github.com/HosokawaR/chatgpt-discord-bot/assets/45098934/68ec4969-8552-4dc5-8845-b7290e526299)

### Web Search

The bot now uses OpenAI's native web search capabilities. OpenAI's API automatically determines when web search is needed for answering questions, providing up-to-date information when relevant.

You can configure web search behavior with this optional environment variable:
- `SEARCH_CONTEXT_SIZE`: Controls how much context is retrieved from the web. Available values:
  - `high`: Most comprehensive context, highest cost, slower response
  - `medium` (default): Balanced context, cost, and latency
  - `low`: Least context, lowest cost, fastest response

## Features

- Can display costs consumed
- Contextualized conversation as it takes into account the most recent message
- Can search the web using OpenAI's native search capabilities
