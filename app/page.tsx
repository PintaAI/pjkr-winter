import { CTAContent } from "@/components/auth/cta-content";
import { EventContent } from "@/components/auth/event-content";
import { HeroContent } from "@/components/auth/home-content";
import { ResortContent } from "@/components/auth/resort-content";

export default function Home() {
  return (
    <main>
      <HeroContent />
      <ResortContent />
      <EventContent />
      <CTAContent />
    </main>
  );
}
