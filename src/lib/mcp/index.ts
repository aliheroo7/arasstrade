import { auth, defineMcp } from "@lovable.dev/mcp-js";

import listCases from "./tools/list-cases";
import getCase from "./tools/get-case";
import postCaseMessage from "./tools/post-case-message";
import listInquiries from "./tools/list-inquiries";

// The OAuth issuer must be the direct Supabase host; only the project ref
// survives publish unchanged and Vite inlines it at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "arasstrade-mcp",
  title: "ArassTrade",
  version: "0.1.0",
  instructions:
    "Tools for ArassTrade (ارس‌ترید), a vehicle import and customs clearance platform. Use `list_cases` and `get_case` to inspect clearance cases, `post_case_message` to reply in a case thread, and `list_inquiries` to review consultation requests. All data is scoped to the signed-in user's permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCases, getCase, postCaseMessage, listInquiries],
});
