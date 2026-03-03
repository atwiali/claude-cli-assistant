/**
 * tool-handlers.ts — Execution logic for each tool.
 *
 * When Claude responds with a `tool_use` content block, we need to
 * actually *run* the requested tool and return the result.  This file
 * contains a single dispatcher function that routes each tool name
 * to its handler.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";
import { dirname } from "node:path";

/* ------------------------------------------------------------------ */
/*  Individual tool handlers                                          */
/* ------------------------------------------------------------------ */

/**
 * Reads a file from disk and returns its text content.
 */
async function handleReadFile(input: { path: string }): Promise<string> {
  const content = await readFile(input.path, "utf-8");
  return content;
}

/**
 * Writes text content to a file, creating parent directories if needed.
 */
async function handleWriteFile(input: { path: string; content: string }): Promise<string> {
  // Ensure the parent directory exists before writing
  await mkdir(dirname(input.path), { recursive: true });
  await writeFile(input.path, input.content, "utf-8");
  return `File written successfully to ${input.path}`;
}

/**
 * Executes a shell command and captures its combined stdout + stderr.
 */
function handleRunCommand(input: { command: string }): string {
  const output = execSync(input.command, {
    encoding: "utf-8",
    // Merge stderr into stdout so we capture everything
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 30_000, // 30-second safety limit
  });
  return output;
}

/* ------------------------------------------------------------------ */
/*  Public dispatcher                                                 */
/* ------------------------------------------------------------------ */

/**
 * Routes a tool call to the correct handler and returns the result
 * as a string.  If anything goes wrong, the error message is returned
 * instead — this lets Claude see the error and decide how to react.
 *
 * @param name  - The tool name from Claude's `tool_use` block.
 * @param input - The input object from Claude's `tool_use` block.
 * @returns A string result to send back as a `tool_result`.
 */
export async function executeTool(
  name: string,
  input: Record<string, string>
): Promise<string> {
  try {
    switch (name) {
      case "read_file":
        return await handleReadFile(input as { path: string });

      case "write_file":
        return await handleWriteFile(input as { path: string; content: string });

      case "run_command":
        return handleRunCommand(input as { command: string });

      default:
        return `Error: Unknown tool "${name}"`;
    }
  } catch (error) {
    // Return the error message so Claude can see what went wrong
    const message = error instanceof Error ? error.message : String(error);
    return `Error executing ${name}: ${message}`;
  }
}
