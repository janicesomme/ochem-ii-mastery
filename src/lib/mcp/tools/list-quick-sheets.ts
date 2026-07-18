import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_quick_sheets",
  title: "List quick sheets",
  description:
    "List all Quick Sheets — short, high-yield summaries covering Ochem II topics.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { quickSheets } = await import("../../mock-data");
    return {
      content: [{ type: "text", text: JSON.stringify(quickSheets, null, 2) }],
      structuredContent: { quick_sheets: quickSheets },
    };
  },
});
