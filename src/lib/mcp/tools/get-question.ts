import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_question",
  title: "Get question",
  description:
    "Fetch a single question with its progressive hints, step-by-step solution, and final answer.",
  inputSchema: {
    question_id: z.string().describe("Question id, e.g. 'q-5'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ question_id }) => {
    const { mockQuestion } = await import("../../mock-data");
    const full = mockQuestion(question_id);
    if (!full) {
      return {
        content: [{ type: "text", text: `Question '${question_id}' not found.` }],
        isError: true,
      };
    }
    const payload = {
      question: full.q,
      hints: full.hints,
      steps: full.steps,
      answer: full.answer,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
