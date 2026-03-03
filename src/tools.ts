/**
 * tools.ts — Tool definitions for the CLI assistant.
 *
 * Each tool is described using JSON Schema so that Claude understands
 * what parameters it can pass when it decides to invoke a tool.
 * We export the array directly so it can be plugged into any
 * `messages.create()` call.
 */

import Anthropic from "@anthropic-ai/sdk";

/**
 * The type expected by the SDK's `tools` parameter.
 * Using it here gives us autocomplete and compile-time safety.
 */
type Tool = Anthropic.Messages.Tool;

/* ------------------------------------------------------------------ */
/*  Tool definitions                                                  */
/* ------------------------------------------------------------------ */

/**
 * read_file — Reads the contents of a file at the given path.
 *
 * Claude will call this when it needs to inspect a file on disk
 * (e.g. to understand existing code before editing it).
 */
const readFileTool: Tool = {
  name: "read_file",
  description:
    "Read the contents of a file at the specified path. " +
    "Returns the full text of the file.",
  input_schema: {
    type: "object" as const,
    properties: {
      path: {
        type: "string",
        description: "Absolute or relative path to the file to read.",
      },
    },
    required: ["path"],
  },
};

/**
 * write_file — Creates or overwrites a file with the given content.
 *
 * Claude will call this when it wants to create a new file or
 * replace an existing one (e.g. generating code, saving configs).
 */
const writeFileTool: Tool = {
  name: "write_file",
  description:
    "Write content to a file at the specified path. " +
    "Creates the file if it doesn't exist, or overwrites it if it does.",
  input_schema: {
    type: "object" as const,
    properties: {
      path: {
        type: "string",
        description: "Absolute or relative path to the file to write.",
      },
      content: {
        type: "string",
        description: "The text content to write into the file.",
      },
    },
    required: ["path", "content"],
  },
};

/**
 * run_command — Executes a shell command and returns its output.
 *
 * Claude will call this for tasks like installing packages,
 * running tests, or checking git status.
 */
const runCommandTool: Tool = {
  name: "run_command",
  description:
    "Execute a shell command and return its stdout and stderr. " +
    "Use this for running scripts, installing packages, or any CLI task.",
  input_schema: {
    type: "object" as const,
    properties: {
      command: {
        type: "string",
        description: "The shell command to execute (e.g. 'ls -la' or 'npm test').",
      },
    },
    required: ["command"],
  },
};

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

/** All tools that the assistant can use, bundled as a single array. */
export const tools: Tool[] = [readFileTool, writeFileTool, runCommandTool];
