import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const CASE_STATUSES = [
  "draft",
  "opened",
  "documents_pending",
  "in_customs",
  "cleared",
  "delivered",
  "closed",
  "cancelled",
] as const;

export default defineTool({
  name: "list_cases",
  title: "List clearance cases",
  description:
    "List import/customs clearance cases visible to the signed-in user, optionally filtered by status or a text search over case code, tracking code and title.",
  inputSchema: {
    status: z.enum(CASE_STATUSES).optional().describe("Filter by case status."),
    search: z.string().trim().max(120).optional().describe("Text search."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, search, limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("cases")
      .select(
        "id, case_code, tracking_code, type, title, status, priority, opened_at, updated_at, customer:customers(id, display_name, company_name)",
      )
      .order("updated_at", { ascending: false })
      .limit(limit ?? 25);

    if (status) q = q.eq("status", status);
    if (search) {
      const s = search.replace(/[,()]/g, " ");
      q = q.or(`case_code.ilike.%${s}%,title.ilike.%${s}%,tracking_code.ilike.%${s}%`);
    }

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { cases: data ?? [] },
    };
  },
});
