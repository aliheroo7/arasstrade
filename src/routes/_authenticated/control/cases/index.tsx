import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  PRIORITY_LABELS,
  CASE_STATUSES,
  CASE_TYPES,
  CASE_PRIORITIES,
  createCase,
  listCases,
  listCustomersForPicker,
} from "@/lib/cases.functions";

export const Route = createFileRoute("/_authenticated/control/cases/")({
  component: CasesListPage,
});

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  opened: "bg-brand-blue/10 text-brand-blue",
  documents_pending: "bg-yellow-500/10 text-yellow-600",
  in_customs: "bg-orange-500/10 text-orange-600",
  cleared: "bg-green-500/10 text-green-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
  closed: "bg-muted text-foreground",
  cancelled: "bg-red-500/10 text-red-600",
};

function CasesListPage() {
  const navigate = useNavigate();
  const fetchList = useServerFn(listCases);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "cases", { status, search }],
    queryFn: () =>
      fetchList({
        data: {
          status: (status || undefined) as never,
          search: search.trim() || undefined,
        },
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold mb-1">پرونده‌ها</h1>
          <p className="text-xs text-muted-foreground">مدیریت پرونده‌های ترخیص و واردات مشتریان</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 bg-brand-blue text-white text-xs font-bold rounded-xl px-4 h-10 hover:opacity-90"
        >
          <Plus className="size-4" />
          پرونده جدید
        </button>
      </div>

      <div className="flex gap-2 flex-wrap items-center bg-surface border border-border rounded-2xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در عنوان، کد پرونده، کد رهگیری..."
            className="w-full bg-background border border-border rounded-xl h-10 pr-9 pl-3 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-background border border-border rounded-xl h-10 px-3 text-sm"
        >
          <option value="">همه وضعیت‌ها</option>
          {CASE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-10 grid place-items-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">خطا در دریافت پرونده‌ها: {(error as Error).message}</div>
        ) : !data || data.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">پرونده‌ای یافت نشد.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr className="text-right text-[11px] font-bold text-muted-foreground">
                <th className="p-3">کد پرونده</th>
                <th className="p-3">عنوان</th>
                <th className="p-3">مشتری</th>
                <th className="p-3">نوع</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">اولویت</th>
                <th className="p-3">آخرین تغییر</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => {
                const customer = (c as unknown as { customer: { display_name: string | null; company_name: string | null } | null }).customer;
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate({ to: "/control/cases/$id", params: { id: c.id } })}
                    className="border-b border-border last:border-0 hover:bg-background/60 cursor-pointer"
                  >
                    <td className="p-3 font-mono text-xs">{c.case_code}</td>
                    <td className="p-3 font-bold">{c.title}</td>
                    <td className="p-3 text-muted-foreground">
                      {customer?.company_name || customer?.display_name || "—"}
                    </td>
                    <td className="p-3 text-xs">{TYPE_LABELS[c.type as keyof typeof TYPE_LABELS] ?? c.type}</td>
                    <td className="p-3">
                      <span className={`inline-block text-[11px] rounded-full px-2 py-1 ${STATUS_TONE[c.status] ?? ""}`}>
                        {STATUS_LABELS[c.status as keyof typeof STATUS_LABELS] ?? c.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      {PRIORITY_LABELS[c.priority as keyof typeof PRIORITY_LABELS] ?? c.priority}
                    </td>
                    <td className="p-3 text-[11px] text-muted-foreground">
                      {new Date(c.updated_at).toLocaleDateString("fa-IR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Link to="/control" className="text-xs text-muted-foreground hover:text-foreground inline-block">
        ← بازگشت به داشبورد
      </Link>

      {creating ? <CreateCaseDialog onClose={() => setCreating(false)} /> : null}
    </div>
  );
}

function CreateCaseDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchCustomers = useServerFn(listCustomersForPicker);
  const createFn = useServerFn(createCase);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [type, setType] = useState<(typeof CASE_TYPES)[number]>("vehicle_clearance");
  const [priority, setPriority] = useState<(typeof CASE_PRIORITIES)[number]>("normal");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const customersQ = useQuery({
    queryKey: ["admin", "customers-picker", customerSearch],
    queryFn: () => fetchCustomers({ data: { search: customerSearch.trim() || undefined } }),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createFn({
        data: { customer_id: customerId, type, title, summary: summary || undefined, priority },
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin", "cases"] });
      onClose();
      navigate({ to: "/control/cases/$id", params: { id: res.id } });
    },
  });

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg space-y-4"
      >
        <h2 className="font-extrabold text-lg">ایجاد پرونده جدید</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-bold">مشتری</label>
          <input
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="جستجوی مشتری..."
            className="w-full bg-background border border-border rounded-xl h-10 px-3 text-sm"
          />
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full bg-background border border-border rounded-xl h-10 px-3 text-sm"
          >
            <option value="">— انتخاب کنید —</option>
            {(customersQ.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name || c.display_name || c.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold">نوع پرونده</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as (typeof CASE_TYPES)[number])}
              className="w-full bg-background border border-border rounded-xl h-10 px-3 text-sm"
            >
              {CASE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold">اولویت</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as (typeof CASE_PRIORITIES)[number])}
              className="w-full bg-background border border-border rounded-xl h-10 px-3 text-sm"
            >
              {CASE_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold">عنوان</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: ترخیص پژو 207 از بندر عباس"
            className="w-full bg-background border border-border rounded-xl h-10 px-3 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold">توضیحات (اختیاری)</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full bg-background border border-border rounded-xl p-3 text-sm"
          />
        </div>

        {mutation.error ? (
          <div className="text-xs text-red-600">{(mutation.error as Error).message}</div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="text-xs font-bold px-4 h-10 rounded-xl border border-border hover:bg-background"
          >
            انصراف
          </button>
          <button
            disabled={!customerId || title.trim().length < 2 || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="text-xs font-bold px-4 h-10 rounded-xl bg-brand-blue text-white disabled:opacity-50"
          >
            {mutation.isPending ? "در حال ایجاد..." : "ایجاد پرونده"}
          </button>
        </div>
      </div>
    </div>
  );
}