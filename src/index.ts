/**
 * index.ts — Entry point for the Claude CLI Assistant.
 *
 * This file wires everything together:
 *  1. Creates an Anthropic client (authenticated via env var).
 *  2. Reads user input from the terminal.
 *  3. Sends messages to Claude along with tool definitions.
 *  4. When Claude requests a tool, executes it and feeds the result back.
 *  5. Loops until Claude finishes its response, then prompts for the next input.
 */

import "dotenv/config"; // Load .env file into process.env
import Anthropic from "@anthropic-ai/sdk";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { tools } from "./tools.js";
import { executeTool } from "./tool-handlers.js";

/* ------------------------------------------------------------------ */
/*  Client setup                                                      */
/* ------------------------------------------------------------------ */

/**
 * The SDK automatically reads `ANTHROPIC_API_KEY` from the environment,
 * so we don't need to pass it explicitly.
 */
const client = new Anthropic();

/** Conversation history — persists across turns so Claude has full context. */
const messages: Anthropic.Messages.MessageParam[] = [];

/* ------------------------------------------------------------------ */
/*  Agentic loop                                                      */
/* ------------------------------------------------------------------ */

/**
 * Processes a single user message through the full agentic loop:
 *
 *  1. Append the user message to conversation history.
 *  2. Call the Claude API with the full history + tool definitions.
 *  3. Print any text Claude returns.
 *  4. If Claude's `stop_reason` is `"tool_use"`, execute each requested
 *     tool, append the results, and loop back to step 2.
 *  5. If `stop_reason` is `"end_turn"`, we're done — return to the prompt.
 */
async function handleUserMessage(userText: string): Promise<void> {
  // Step 1: Add the user's message to the conversation history
  messages.push({ role: "user", content: userText });

  // Step 2–5: Keep calling Claude until it stops requesting tools
  while (true) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools,
      messages,
    });

    // Step 3: Print any text blocks Claude returned
    for (const block of response.content) {
      if (block.type === "text") {
        console.log(`\nClaude: ${block.text}`);
      }
    }

    // Step 4a: If Claude is done talking, exit the loop
    if (response.stop_reason === "end_turn") {
      // Save the assistant's response to history for future context
      messages.push({ role: "assistant", content: response.content });
      break;
    }

    // Step 4b: If Claude wants to use tools, execute them
    if (response.stop_reason === "tool_use") {
      // Save the assistant's tool_use response to history
      messages.push({ role: "assistant", content: response.content });

      // Execute each tool and collect results
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          console.log(`\n[Tool Call] ${block.name}(${JSON.stringify(block.input)})`);

          const result = await executeTool(
            block.name,
            block.input as Record<string, string>
          );

          console.log(`[Tool Result] ${result.slice(0, 200)}${result.length > 200 ? "..." : ""}`);

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      // Send all tool results back to Claude in a single user message
      messages.push({ role: "user", content: toolResults });

      // Loop back to step 2 — Claude will continue with the tool results
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Interactive prompt                                                */
/* ------------------------------------------------------------------ */

/**
 * Main loop: reads user input line-by-line and processes each message.
 * Type "exit" or "quit" to end the session.
 */
async function main(): Promise<void> {
  const rl = createInterface({ input: stdin, output: stdout });

  console.log("Claude CLI Assistant");
  console.log("Type your message and press Enter. Type 'exit' to quit.\n");

  while (true) {
    const userInput = await rl.question("You: ");

    // Check for exit commands
    if (["exit", "quit"].includes(userInput.trim().toLowerCase())) {
      console.log("Goodbye!");
      rl.close();
      break;
    }

    // Skip empty input
    if (!userInput.trim()) continue;

    try {
      await handleUserMessage(userInput);
    } catch (error) {
      console.error("\nError:", error instanceof Error ? error.message : error);
    }
  }
}

// Start the assistant
main();
