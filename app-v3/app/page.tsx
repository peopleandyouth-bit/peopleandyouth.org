import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PlatformSections from "@/components/home/PlatformSections";
import FounderStory from "@/components/home/FounderStory";
import DissentDias from "@/components/home/DissentDias";
import ThinkTankJournals from "@/components/home/ThinkTankJournals";
import MembershipPreview from "@/components/home/MembershipPreview";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* IMPOSSIBLE TO MISS RED TEST BANNER */}
      <div className="bg-red-600 text-white text-center py-4 px-4 text-xl font-black uppercase tracking-widest border-b-4 border-yellow-400 z-50 relative">
        🔥 VERCEL LIVE UPDATE IS WORKING!
      </div>

      <Navbar />
      <Hero />
      <PlatformSections />
      <FounderStory />
      <DissentDias />
      <ThinkTankJournals />
      <MembershipPreview />
      <Footer />
    </main>
  );
}