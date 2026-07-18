import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_chapter",
  title: "Get chapter",
  description:
    "Fetch a single chapter with its topics and question summaries by chapter id.",
  inputSchema: {
    chapter_id: z.string().describe("Chapter id, e.g. 'ch-eas'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ chapter_id }) => {
    const { mockChapter, mockTopicsByChapter, mockQuestionsByChapter } =
      await import("../../mock-data");
    const chapter = mockChapter(chapter_id);
    if (!chapter) {
      return {
        content: [{ type: "text", text: `Chapter '${chapter_id}' not found.` }],
        isError: true,
      };
    }
    const topics = mockTopicsByChapter(chapter_id);
    const questions = mockQuestionsByChapter(chapter_id);
    const payload = { chapter, topics, questions };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
