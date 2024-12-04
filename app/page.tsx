import { HomeContent } from "@/components/auth/home-content"
import { ModeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div >
      <div >
        <ModeToggle />
      </div>
      <HomeContent />
    </div>
  )
}
