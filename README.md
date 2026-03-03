# claude-cli-assistant

A terminal-based assistant that can read/write files, run shell commands, and search the web — all powered by Claude's tool use.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

```bash
# Install dependencies
npm install
```

Create a `.env` file in the project root with your API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

> The `.env` file is already in `.gitignore` so your key won't be committed.

## Usage

```bash
# Build and run
npm run dev

# Or build and run separately
npm run build
npm start
```

## Project Structure

```
src/
├── index.ts          — Entry point: interactive chat loop with agentic tool execution
├── tools.ts          — Tool definitions (JSON Schema) passed to the Claude API
└── tool-handlers.ts  — Execution logic for each tool (read, write, run)
```

## Available Tools

| Tool | Parameters | Description |
|------|-----------|-------------|
| `read_file` | `path` | Reads the contents of a file |
| `write_file` | `path`, `content` | Creates or overwrites a file |
| `run_command` | `command` | Executes a shell command and returns output |

## Tech Stack

- **TypeScript** with ES Modules
- **Anthropic SDK** (`@anthropic-ai/sdk`)
- **Node.js** runtime

## License

ISC
