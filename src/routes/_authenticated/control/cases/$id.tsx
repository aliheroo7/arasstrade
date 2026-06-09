import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, Lock, FileText } from "lucide-react";
import {
  CASE_PRIORITIES,
  CASE_STATUSES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
  getCaseDetail,
  postCaseMessage,
  updateCaseStatus,
} from "@/lib/cases.functions";

export const Route = createFileRoute("/_authenticated/control/cases/$id")({
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchDetail = useServerFn(getCaseDetail);
  const updateFn = useServerFn(updateCaseStatus);
  const postFn = useServerFn(postCaseMessage);

  const detailQ = useQuery({
    queryKey: ["admin", "case", id],
    queryFn: () => fetchDetail({ data: { id } }),
  });

  const [msg, setMsg] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const statusM = useMutation({
    mutationFn: (v: { status: string; priority?: string }) =>
      updateFn({ data: { id, status: v.status as never, priority: v.priority as never } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "case", id] }),
  });

  const postM = useMutation({
    mutationFn: () => postFn({ data: { case_id: id, body: msg, is_internal: isInternal } }),
    onSuccess: () => {
      setMsg("");
      qc.invalidateQueries({ queryKey: ["admin", "case", id] });
    },
  });

  if (detailQ.isLoading) {
    return (
      <div className="grid place-items-center p-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (detailQ.error) {
    return <div className="text-sm text-red-600">{(detailQ.error as Error).message}</div>;
  }
  const data = detailQ.data!;
  const c = data.case as unknown as {
    id: string;
    case_code: string;
    tracking_code: string;
    title: string;
    type: string;
    status: string;
    priority: string;
    summary: string | null;
    opened_at: string | null;
    created_at: string;
    customer: {
      id: string;
      display_name: string | null;
      company_name: string | null;
      national_id: string | null;
      company_id: string | null;
      kyc_status: string;
    } | null;
  };

  return (
    <div className="space-y-6">
      <Link to="/control/cases" className="text-xs text-muted-foreground hover:text-foreground inline-block">
        ← همه پرونده‌ها
      </Link>

      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="font-mono">{c.case_code}</span>
              <span>·</span>
              <span>کد رهگیری: <span className="font-mono">{c.tracking_code}</span></span>
            </div>
            <h1 className="text-xl font-extrabold">{c.title}</h1>
            <div className="text-xs text-muted-foreground mt-1">
              {TYPE_LABELS[c.type as keyof typeof TYPE_LABELS] ?? c.type}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={c.status}
              onChange={(e) => statusM.mutate({ status: e.target.value })}
              className="bg-background border border-border rounded-xl h-9 px-3 text-xs font-bold"
            >
              {CASE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <select
              value={c.priority}
              onChange={(e) => statusM.mutate({ status: c.status, priority: e.target.value })}
              className="bg-background border border-border rounded-xl h-9 px-3 text-xs font-bold"
            >
              {CASE_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {c.summary ? <p className="text-sm leading-7 text-muted-foreground">{c.summary}</p> : null}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-border">
          <Field label="مشتری" value={c.customer?.company_name || c.customer?.display_name || "—"} />
          <Field label="کد ملی / شناسه" value={c.customer?.national_id || c.customer?.company_id || "—"} />
          <Field label="وضعیت احراز" value={c.customer?.kyc_status ?? "—"} />
          <Field
            label="تاریخ ایجاد"
            value={new Date(c.created_at).toLocaleDateString("fa-IR")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-sm">گفتگو</h2>
          <div className="space-y-3 max-h-[400px] overflow-auto">
            {data.messages.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">پیامی ثبت نشده است.</div>
            ) : (
              data.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl p-3 text-sm border ${
                    m.is_internal
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : m.sender_role === "admin"
                        ? "border-brand-blue/20 bg-brand-blue/5"
                        : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                    <span className="font-bold">
                      {m.sender_role === "admin" ? "ادمین" : m.sender_role === "customer" ? "مشتری" : "سیستم"}
                    </span>
                    {m.is_internal ? (
                      <span className="inline-flex items-center gap-1 text-yellow-600">
                        <Lock className="size-3" /> یادداشت داخلی
                      </span>
                    ) : null}
                    <span>·</span>
                    <span>{new Date(m.created_at).toLocaleString("fa-IR")}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-7">{m.body}</div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={3}
              placeholder="پیام به مشتری یا یادداشت داخلی..."
              className="w-full bg-background border border-border rounded-xl p-3 text-sm"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                یادداشت داخلی (برای مشتری قابل مشاهده نیست)
              </label>
              <button
                onClick={() => postM.mutate()}
                disabled={msg.trim().length === 0 || postM.isPending}
                className="inline-flex items-center gap-1.5 bg-brand-blue text-white text-xs font-bold rounded-xl px-4 h-9 disabled:opacity-50"
              >
                <Send className="size-3.5" />
                ارسال
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="font-bold text-sm mb-3">اسناد ({data.documents.length})</h2>
            {data.documents.length === 0 ? (
              <div className="text-xs text-muted-foreground">هنوز سندی بارگذاری نشده است.</div>
            ) : (
              <ul className="space-y-2">
                {data.documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-xs">
                    <FileText className="size-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate">{d.file_name}</span>
                    <span className="text-[10px] text-muted-foreground">{d.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="font-bold text-sm mb-3">تاریخچه وضعیت</h2>
            {data.history.length === 0 ? (
              <div className="text-xs text-muted-foreground">—</div>
            ) : (
              <ol className="space-y-2 text-xs">
                {data.history.map((h) => (
                  <li key={h.id} className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-brand-blue mt-1.5" />
                    <div className="flex-1">
                      <div>
                        {h.from_status
                          ? `${STATUS_LABELS[h.from_status as keyof typeof STATUS_LABELS] ?? h.from_status} → `
                          : ""}
                        <span className="font-bold">
                          {STATUS_LABELS[h.to_status as keyof typeof STATUS_LABELS] ?? h.to_status}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(h.created_at).toLocaleString("fa-IR")}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-bold mt-0.5">{value}</div>
    </div>
  );
}