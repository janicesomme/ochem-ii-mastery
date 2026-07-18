import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_quick_sheet",
  title: "Get quick sheet",
  description: "Fetch a single Quick Sheet with its full content by id.",
  inputSchema: {
    quick_sheet_id: z.string().describe("Quick sheet id."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ quick_sheet_id }) => {
    const { mockQuickSheet } = await import("../../mock-data");
    const sheet = mockQuickSheet(quick_sheet_id);
    if (!sheet) {
      return {
        content: [{ type: "text", text: `Quick sheet '${quick_sheet_id}' not found.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(sheet, null, 2) }],
      structuredContent: { quick_sheet: sheet },
    };
  },
});
