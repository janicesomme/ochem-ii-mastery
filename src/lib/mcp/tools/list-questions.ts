import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_questions",
  title: "List questions",
  description:
    "List questions in the question bank, optionally filtered by chapter, topic, question type, or difficulty. Returns question summaries (no hints or answers).",
  inputSchema: {
    chapter_id: z.string().optional().describe("Filter to this chapter id."),
    topic_id: z.string().optional().describe("Filter to this topic id."),
    question_type: z
      .string()
      .optional()
      .describe("Filter by question type, e.g. 'mechanism', 'prediction'."),
    difficulty: z
      .enum(["easy", "medium", "hard"])
      .optional()
      .describe("Filter by difficulty."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ chapter_id, topic_id, question_type, difficulty }) => {
    const { questions, mockQuestionsByChapter } = await import("../../mock-data");
    let list = chapter_id ? mockQuestionsByChapter(chapter_id) : questions;
    if (topic_id) list = list.filter((q) => q.topic_id === topic_id);
    if (question_type) list = list.filter((q) => q.question_type === question_type);
    if (difficulty) list = list.filter((q) => q.difficulty === difficulty);
    return {
      content: [{ type: "text", text: JSON.stringify(list, null, 2) }],
      structuredContent: { questions: list, count: list.length },
    };
  },
});
