import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "post_case_message",
  title: "Post a case message",
  description: "Add a message to a clearance case thread as the signed-in user.",
  inputSchema: {
    case_id: z.string().uuid().describe("Case UUID."),
    body: z.string().trim().min(1).max(4000).describe("Message text."),
    is_internal: z
      .boolean()
      .optional()
      .describe("True for an internal admin-only note. Defaults to false."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ case_id, body, is_internal }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("case_messages")
      .insert({
        case_id,
        sender_id: ctx.getUserId(),
        sender_role: "admin",
        body,
        is_internal: is_internal ?? false,
      } as never)
      .select("id, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { message: data },
    };
  },
});
