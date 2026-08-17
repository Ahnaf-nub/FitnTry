import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedLooks } from "@/components/landing/FeaturedLooks";
import { WhyVirtualTryOn } from "@/components/landing/WhyVirtualTryOn";
import { CompleteLook } from "@/components/landing/CompleteLook";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <FeaturedLooks />
      <WhyVirtualTryOn />
      <CompleteLook />
      <FinalCTA />
    </>
  );
}
