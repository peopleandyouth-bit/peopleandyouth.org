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