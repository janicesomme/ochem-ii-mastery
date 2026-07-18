import { defineMcp } from "@lovable.dev/mcp-js";
import getChapterTool from "./tools/get-chapter";
import getQuestionTool from "./tools/get-question";
import getQuickSheetTool from "./tools/get-quick-sheet";
import listChaptersTool from "./tools/list-chapters";
import listQuestionsTool from "./tools/list-questions";
import listQuickSheetsTool from "./tools/list-quick-sheets";

export default defineMcp({
  name: "nofear-ochem2-mcp",
  title: "No-Fear Ochem II Question Bank",
  version: "0.1.0",
  instructions:
    "Read-only access to the No-Fear Ochem II Question Bank: chapters, topics, questions (with progressive hints, step-by-step solutions, and final answers), and Quick Sheets. Use `list_chapters` to browse, `get_chapter` to drill in, `list_questions` (with filters) to find practice, `get_question` for the full hint ladder and answer, and `list_quick_sheets` / `get_quick_sheet` for short high-yield summaries.",
  tools: [
    listChaptersTool,
    getChapterTool,
    listQuestionsTool,
    getQuestionTool,
    listQuickSheetsTool,
    getQuickSheetTool,
  ],
});
