import { Background } from "./background";

export const HeroContent = () => {
  return (
    <div className="h-screen bg-gradient-to-b from-background via-secondary">
      <Background />
      <div className="container relative mx-auto px-4 pt-20 md:pt-16">
        <div className="text-center space-y-0 animate-fade-in">
          <h1 className="bigfont text-6xl md:text-7xl font-bold animate-fade-down text-foreground/90">
            PJKR
          </h1>
          <h2 className=" text-2xl md:text-4xl font-bold animate-fade-down text-foreground/90">
            WINTER SPORTS 2026
          </h2>
          <p className="text-sm animate-fade-down text-foreground/80">
            by Pejuangkorea
          </p>
        </div>

        <div className="flex justify-center py-12 md:py-16">
          <img 
            src="/logo.png" 
            alt="PJKR Winter Sports"
            className="w-48 h-48 md:w-56 md:h-56 animate-fade-up"
          />
        </div>
      </div>

      <div className="absolute scale-90 bottom-5 md:bottom-22 left-0 right-0">
        <div className="text-center max-w-xl mx-auto space-y-3 animate-fade-up">
          <h3 className="text-xl  md:text-3xl font-bold">
          Cinghuyaa!
          </h3>
          <p className="text-sm scale-90 md:text-xl">
          Kamu udah lama dikorea tapi belum pernah main
Ski/Snowboard? Kalo gitu ini waktu yang tepat buat main ski bareng Pejuangkorea!
          </p>
        </div>
      </div>
    </div>
  )
}
