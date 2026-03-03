# claude-cli-assistant

A terminal-based assistant that can read/write files, run shell commands, and search the web — all powered by Claude's tool use.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

```bash
# Install dependencies
npm install

# Set your API key
export ANTHROPIC_API_KEY="sk-ant-..."
```

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
├── index.ts   — Entry point: initializes the Anthropic client and sends a dry-run request
└── tools.ts   — Tool definitions (JSON Schema) passed to the Claude API
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
