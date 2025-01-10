import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CTAContent } from "@/components/auth/cta-content";
import { EventContent } from "@/components/auth/event-content";
import { HeroContent } from "@/components/auth/home-content";
import { ResortContent } from "@/components/auth/resort-content";

export default async function Home() {
  const session = await auth();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main>
      <HeroContent />
      <ResortContent />
      <EventContent />
      <CTAContent />
    </main>
  );
}
