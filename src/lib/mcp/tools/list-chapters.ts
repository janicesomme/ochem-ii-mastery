import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_chapters",
  title: "List chapters",
  description:
    "List all Organic Chemistry II chapters in the No-Fear Ochem II Question Bank, including title, number, and description.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { chapters } = await import("../../mock-data");
    return {
      content: [{ type: "text", text: JSON.stringify(chapters, null, 2) }],
      structuredContent: { chapters },
    };
  },
});
