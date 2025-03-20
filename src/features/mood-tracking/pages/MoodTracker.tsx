import { useRef } from "react";
import HeroSection from "../components/HeroSection";
import MoodAssessment from "../components/MoodAssessment";
import SpecialtiesSection from "../components/SpecialtiesSection";
import HighlightedDoctors from "../components/HighlightedDoctors";
import WhyBookUs from "../components/WhyBookUs";
import PartnerLogos from "../components/PartnerLogos";
import ScrollingInfoStrip from "@/features/ambassadors/components/ScrollingInfoStrip";

const MoodTracker = () => {
  const emotionsRef = useRef<HTMLDivElement>(null);

  const scrollToEmotions = () => {
    emotionsRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple-light via-white to-brand-blue-light">
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-purple-light via-transparent to-brand-blue-light" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.07'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      <HeroSection scrollToEmotions={scrollToEmotions} emotionsRef={emotionsRef} />
      <MoodAssessment emotionsRef={emotionsRef} />
      <SpecialtiesSection />
      <HighlightedDoctors />
      
      <div className="w-full">
        <ScrollingInfoStrip />
      </div>
      
      <WhyBookUs />
      <PartnerLogos />
    </div>
  );
};

export default MoodTracker;
