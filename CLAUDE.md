# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChatGPT Discord Bot - A Discord bot that integrates with OpenAI's ChatGPT API to provide conversational AI capabilities with optional Google search functionality.

## Common Development Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the dist/ directory
- **Start**: `npm start` - Runs the compiled bot from dist/main.js
- **Format**: `npm run format:fix` - Formats code using Rome formatter
- **Run with Docker**: `docker compose --env-file .env up -d`

Note: No test commands are configured in this project.

## High-Level Architecture

### Core Components

1. **Discord Bot Integration** (src/main.ts:6-71)
   - Listens for messages mentioning the bot
   - Manages typing indicators during processing
   - Handles retry logic for API failures
   - Detects search keywords to enable web search functionality

2. **ChatGPT Integration** (src/chatgpt.ts)
   - Manages OpenAI API communication
   - Switches between regular and search-enabled models based on keywords
   - Tracks token usage and calculates costs
   - Maintains conversation context with character limits

3. **Environment Configuration** (src/env.ts)
   - Validates required environment variables (OPENAI_API_KEY, DISCORD_TOKEN)
   - Configures optional settings (models, pricing, limits)
   - Manages model selection for search functionality

4. **Search Functionality**
   - Uses OpenAI's native web search capabilities when keywords are detected
   - Automatically switches to web search-enabled models (gpt-4o by default)

### Key Design Patterns

- **Retry Pattern**: Automatic retry with user feedback for OpenAI API errors (src/main.ts:37-67)
- **Context Management**: Limits conversation history to manage token usage (src/chatgpt.ts:98-103)
- **Cost Tracking**: Calculates and displays API usage costs in responses (src/chatgpt.ts:116-123)
- **Model Selection**: Switches between regular and search-enabled models based on detected keywords

### Configuration Requirements

Essential environment variables:
- `DISCORD_TOKEN`: Bot authentication token
- `OPENAI_API_KEY`: OpenAI API access key

Optional:
- `MODEL`: Default chat model (defaults to gpt-4o-mini)
- `MODEL_FOR_SEARCH`: Model for web search (defaults to gpt-4o)

### Development Notes

- Uses TypeScript with ES modules
- Rome for code formatting (configuration in rome.json)
- Node.js 20.2.0 (managed by Volta)
- All source files in src/ directory compile to dist/