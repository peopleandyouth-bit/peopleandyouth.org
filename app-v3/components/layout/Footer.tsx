import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-16 relative z-10 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
              P&Y
            </div>
            <span className="font-bold text-white text-base">People & Youth</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            At the Heart of Change — Building India’s premier digital institution for public policy, governance research, and rural strategy.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">Pillars</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="#dissent-dias" className="hover:text-cyan-400 transition-colors">Dissent Dias</Link></li>
            <li><Link href="#think-tank" className="hover:text-cyan-400 transition-colors">7 Sovereign Journals</Link></li>
            <li><Link href="#rural-lab" className="hover:text-cyan-400 transition-colors">Rural Advisory Lab</Link></li>
            <li><Link href="#founder" className="hover:text-cyan-400 transition-colors">Founder Journey</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">Governance</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="#membership" className="hover:text-cyan-400 transition-colors">Founding Membership</Link></li>
            <li><span className="text-slate-500">Public Audit Dashboards (Phase 5)</span></li>
            <li><span className="text-slate-500">RTI & Transparency Policy</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">Contact</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            For institutional partnerships, research submissions, or rural consulting inquiries, reach out through the member portal.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <div>© 2026 People & Youth. All Rights Reserved.</div>
        <div className="mt-2 sm:mt-0">Engineered for Vercel Deployment</div>
      </div>
    </footer>
  );
}