"use client";

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrainingSection } from "@/components/TrainingSection";
import { TimerSection } from "@/components/TimerSection";
import { CalculatorsSection } from "@/components/CalculatorsSection";
import { ProgressSection } from "@/components/ProgressSection";
import { WorkoutProvider } from "@/components/WorkoutContext";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <WorkoutProvider>
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 space-y-20 pb-12 sm:space-y-28 sm:pb-16">
          <Hero />
          <TrainingSection />
          <TimerSection />
          <CalculatorsSection />
          <ProgressSection />
        </main>
        <Footer />
      </div>
    </WorkoutProvider>
  );
}
