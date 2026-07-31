"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "articles" | "payments">("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleArticleAction = async (articleId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/admin/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse text-sm">
          Loading Administrative Control Panel...
        </div>
      </main>
    );
  }

  const filteredProfiles = data?.profiles?.filter((p: any) =>
    (p.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.membership_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-xs font-mono text-cyan-400 hover:underline">
                &larr; Return to Main Platform
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Institutional Admin Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              SOVEREIGN CONTROL &amp; AUDIT MONITOR
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-white/10 text-xs">
            {(["overview", "members", "articles", "payments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all uppercase text-[11px] font-mono ${
                  activeTab === tab
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* METRICS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="text-xs font-mono text-slate-400 uppercase">Total Revenue</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-2">
              &#8377;{data?.metrics?.totalRevenue || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Razorpay Verified Settlements</div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="text-xs font-mono text-slate-400 uppercase">Founding Members</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {data?.metrics?.verifiedFounders || 0}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">&#10003; Dissent Cards Generated</div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="text-xs font-mono text-slate-400 uppercase">Total Accounts</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {data?.metrics?.totalMembers || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Authenticated Auth Sessions</div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="text-xs font-mono text-slate-400 uppercase">Pending Papers</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2">
              {data?.metrics?.pendingArticles || 0}
            </div>
            <div className="text-[10px] text-amber-300 mt-1">Awaiting Think Tank Review</div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW SUMMARY */}
        {activeTab === "overview" && (
          <div className="glass-panel p-8 rounded-3xl border border-cyan-500/20 space-y-6">
            <h3 className="text-lg font-bold text-white">System Status Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-slate-400">Database Engine</span>
                  <span className="text-emerald-400 font-mono font-bold">Supabase PostgreSQL Connected</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-slate-400">Payment Gateway</span>
                  <span className="text-cyan-400 font-mono font-bold">Razorpay API Route Online</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-slate-400">Debate Engine</span>
                  <span className="text-cyan-400 font-mono font-bold">Dissent Dias Protocol Active</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-slate-400">Verification Engine</span>
                  <span className="text-emerald-400 font-mono font-bold">QR Server Dynamic Renderer Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERS DIRECTORY */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <input
                type="text"
                placeholder="Search by Name, Email, or Member ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-white/10 font-mono text-slate-400 uppercase">
                    <tr>
                      <th className="p-4">Member Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Membership ID</th>
                      <th className="p-4">Founding Member</th>
                      <th className="p-4">Card Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProfiles?.map((member: any) => (
                      <tr key={member.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-semibold text-white">{member.full_name || "N/A"}</td>
                        <td className="p-4 text-slate-300 font-mono">{member.email}</td>
                        <td className="p-4 font-mono text-cyan-400">{member.membership_id || "Unassigned"}</td>
                        <td className="p-4">
                          {member.is_founding_member ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                              VERIFIED (&#8377;{member.amount_paid})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400">
                              Standard User
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {member.membership_id && (
                            <Link
                              href={`/verify/${member.membership_id}`}
                              target="_blank"
                              className="text-cyan-400 hover:underline font-mono"
                            >
                              View Card &rarr;
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ARTICLE APPROVALS */}
        {activeTab === "articles" && (
          <div className="space-y-4">
            {data?.articles?.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl text-slate-400 text-sm">
                No policy submissions pending review.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data?.articles?.map((article: any) => (
                  <div key={article.id} className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                          {article.category}
                        </span>
                        <span className="text-xs text-slate-400">By {article.author_name} ({article.author_email})</span>
                      </div>
                      <h4 className="text-base font-bold text-white">{article.title}</h4>
                      <p className="text-xs text-slate-300">{article.abstract}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {article.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleArticleAction(article.id, "approved")}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Approve &amp; Publish
                          </button>
                          <button
                            onClick={() => handleArticleAction(article.id, "rejected")}
                            className="px-4 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold text-xs"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                          article.status === "approved" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-red-950 text-red-300 border border-red-800"
                        }`}>
                          {article.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRANSACTIONS */}
        {activeTab === "payments" && (
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-white/10 font-mono text-slate-400 uppercase">
                  <tr>
                    <th className="p-4">Customer Email</th>
                    <th className="p-4">Razorpay Order ID</th>
                    <th className="p-4">Payment ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.profiles
                    ?.filter((p: any) => p.payment_status === "completed")
                    ?.map((pay: any) => (
                      <tr key={pay.id} className="hover:bg-slate-900/50">
                        <td className="p-4 font-semibold text-white">{pay.email}</td>
                        <td className="p-4 font-mono text-slate-400">{pay.razorpay_order_id || "N/A"}</td>
                        <td className="p-4 font-mono text-cyan-400">{pay.razorpay_payment_id || "N/A"}</td>
                        <td className="p-4 font-bold text-emerald-400">&#8377;{pay.amount_paid}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                            SETTLED
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}