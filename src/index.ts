/**
 * index.ts — Entry point for the Claude CLI Assistant.
 *
 * This file wires everything together:
 *  1. Creates an Anthropic client (authenticated via env var).
 *  2. Sends a "dry run" message to Claude along with our tool definitions.
 *  3. Prints the raw JSON response so we can inspect the content array.
 */

import Anthropic from "@anthropic-ai/sdk";
import { tools } from "./tools.js"; // .js extension required for ESM imports

/* ------------------------------------------------------------------ */
/*  Client setup                                                      */
/* ------------------------------------------------------------------ */

/**
 * The SDK automatically reads `ANTHROPIC_API_KEY` from the environment,
 * so we don't need to pass it explicitly.  If the key is missing the
 * SDK will throw a clear error at call time.
 */
const client = new Anthropic();

/* ------------------------------------------------------------------ */
/*  Dry-run function                                                  */
/* ------------------------------------------------------------------ */

/**
 * Sends a simple prompt to Claude together with our tool definitions.
 *
 * This is a "dry run" — we just want to see Claude's response when it
 * knows tools are available.  We're NOT executing any tools yet; that
 * comes in a later step.
 *
 * @returns The full API response object from `messages.create()`.
 */
async function dryRun() {
  const response = await client.messages.create({
    /**
     * `model` — Which Claude model to use.
     * "claude-sonnet-4-20250514" is fast, capable, and cost-effective
     * for development and testing.
     */
    model: "claude-sonnet-4-20250514",

    /**
     * `max_tokens` — Upper limit on how many tokens Claude can generate
     * in its reply.  1024 is plenty for a short acknowledgement.
     */
    max_tokens: 1024,

    /**
     * `tools` — The array of tool definitions from tools.ts.
     * Claude uses these schemas to understand *what* it can do.
     * It may respond with a `tool_use` content block if it decides
     * a tool is needed, or with plain text if it doesn't.
     */
    tools,

    /**
     * `messages` — The conversation history.
     * For this dry run we send a single user message that should
     * prompt Claude to acknowledge the available tools.
     */
    messages: [
      {
        role: "user",
        content:
          "Hello! Can you see my tools? Please list them and briefly describe what each one does.",
      },
    ],
  });

  return response;
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

/**
 * Top-level async IIFE that runs the dry-run call and prints
 * the full JSON response to the console.
 */
(async () => {
  console.log("Sending dry-run request to Claude...\n");

  try {
    const response = await dryRun();

    // Pretty-print the entire response so we can study the structure
    console.log("=== Raw API Response ===\n");
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("API call failed:", error);
    process.exit(1);
  }
})();
