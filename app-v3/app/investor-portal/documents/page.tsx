import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireInvestor } from "@/lib/investor-portal-auth";
import {
  projectDocumentsForInvestor,
  type InternalDocument,
} from "@/lib/investor-portal-projection";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number | null | undefined) {
  const amount = Number(bytes ?? 0);
  if (amount < 1024) return `${amount} B`;
  if (amount < 1024 * 1024) return `${(amount / 1024).toFixed(0)} KB`;
  return `${(amount / 1024 / 1024).toFixed(1)} MB`;
}

const CATEGORY_ORDER = [
  "Executive Summary",
  "Pitch Deck",
  "Financial Model",
  "Legal",
  "Market Research",
  "Investor Material",
  "Institutional",
];

function categoryRank(category: string) {
  const idx = CATEGORY_ORDER.indexOf(category);
  return idx === -1 ? CATEGORY_ORDER.length : idx;
}

export default async function InvestorPortalDocumentsPage() {
  const auth = await requireInvestor();

  if (auth.authorized === false) {
    redirect("/investor-login");
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only path.
        },
      },
    }
  );

  const { data } = await supabase
    .from("investor_documents")
    .select(
      "id, title, description, category, file_type, file_size_bytes, access_level, display_order, created_at, updated_at"
    )
    .eq("is_active", true)
    .in("access_level", ["PUBLIC", "APPROVED"])
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const documents = projectDocumentsForInvestor(
    (data ?? []) as unknown as InternalDocument[]
  );

  const grouped = new Map<string, typeof documents>();

  for (const doc of documents) {
    const category = doc.category || "Institutional";
    const list = grouped.get(category) ?? [];
    list.push(doc);
    grouped.set(category, list);
  }

  const orderedCategories = Array.from(grouped.keys()).sort(
    (a, b) => categoryRank(a) - categoryRank(b)
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Documents
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          Your private People &amp; Youth documents.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          Materials made available to you as part of your relationship with
          the institution. Access is audited and time-limited.
        </p>
      </header>

      {documents.length === 0 ? (
        <div className="border-t border-[#f5f0e6]/8 pt-10 text-center">
          <p className="text-sm text-[#f5f0e6]/50">
            No documents have been made available yet.
          </p>
          <p className="mt-2 text-xs text-[#f5f0e6]/35">
            Investor Relations will notify you when new materials are
            published.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {orderedCategories.map((category) => {
            const items = grouped.get(category) ?? [];

            return (
              <section key={category}>
                <div className="flex items-baseline justify-between border-b border-[#f5f0e6]/8 pb-3">
                  <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-[#c8a56b]/80">
                    {category}
                  </h2>
                  <span className="text-[10px] tracking-[0.2em] text-[#f5f0e6]/35">
                    {items.length} document
                    {items.length === 1 ? "" : "s"}
                  </span>
                </div>

                <ul className="divide-y divide-[#f5f0e6]/6">
                  {items.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium text-[#f5f0e6]">
                          {doc.title}
                        </p>

                        {doc.description && (
                          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#f5f0e6]/45">
                            {doc.description}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-[#f5f0e6]/30">
                          {doc.file_type && <span>{doc.file_type}</span>}
                          {doc.file_size_bytes && (
                            <span>{formatBytes(doc.file_size_bytes)}</span>
                          )}
                          {doc.updated_at && (
                            <span>
                              Updated{" "}
                              {new Date(
                                doc.updated_at
                              ).toLocaleDateString("en-IN", {
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                          {doc.access_level === "PUBLIC" && (
                            <span className="text-[#c8a56b]/60">
                              Public
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link
                          href={`/api/investors/document?id=${encodeURIComponent(
                            doc.id
                          )}`}
                          className="inline-block rounded-lg border border-[#c8a56b]/40 px-4 py-2 text-xs tracking-wider text-[#c8a56b] transition hover:bg-[#c8a56b]/10"
                        >
                          View document →
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <div className="border-t border-[#f5f0e6]/8 pt-6 text-xs text-[#f5f0e6]/35">
        Documents are served through time-limited signed URLs. Access
        requests are audited. If you need a document you cannot see, please
        contact Investor Relations.
      </div>
    </div>
  );
}