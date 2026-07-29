import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_case",
  title: "Get case detail",
  description:
    "Fetch one clearance case with its messages, status history and document metadata. Accepts the case id, case code or tracking code.",
  inputSchema: {
    id: z.string().uuid().optional().describe("Case UUID."),
    code: z.string().trim().max(64).optional().describe("Case code or tracking code."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, code }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (!id && !code) {
      return { content: [{ type: "text", text: "Provide either id or code." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    let caseId = id;
    if (!caseId && code) {
      const { data: found, error } = await supabase
        .from("cases")
        .select("id")
        .or(`case_code.eq.${code},tracking_code.eq.${code}`)
        .maybeSingle();
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      if (!found) return { content: [{ type: "text", text: "Case not found" }], isError: true };
      caseId = found.id;
    }

    const [caseRes, msgsRes, historyRes, docsRes] = await Promise.all([
      supabase
        .from("cases")
        .select("*, customer:customers(id, display_name, company_name, kyc_status)")
        .eq("id", caseId!)
        .maybeSingle(),
      supabase
        .from("case_messages")
        .select("id, body, sender_role, is_internal, created_at")
        .eq("case_id", caseId!)
        .order("created_at", { ascending: true }),
      supabase
        .from("case_status_history")
        .select("*")
        .eq("case_id", caseId!)
        .order("created_at", { ascending: false }),
      supabase
        .from("documents")
        .select("id, file_name, category, verification_status, created_at")
        .eq("case_id", caseId!)
        .order("created_at", { ascending: false }),
    ]);

    if (caseRes.error) return { content: [{ type: "text", text: caseRes.error.message }], isError: true };
    if (!caseRes.data) return { content: [{ type: "text", text: "Case not found" }], isError: true };

    const payload = {
      case: caseRes.data,
      messages: msgsRes.data ?? [],
      history: historyRes.data ?? [],
      documents: docsRes.data ?? [],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
