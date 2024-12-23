import { Background } from "./background";

export const HeroContent = () => {
  return (
    <div className="h-screen bg-gradient-to-b from-background to-secondary">
      <Background />
      <div className="container relative mx-auto px-4 pt-20 md:pt-16">
        <div className="text-center space-y-0 animate-fade-in">
          <h1 className="bigfont text-6xl md:text-7xl font-bold animate-fade-down text-foreground/90">
            PJKR
          </h1>
          <h2 className=" text-2xl md:text-4xl font-bold animate-fade-down text-foreground/90">
            WINTER SPORTS 2025
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

      <div className="absolute bottom-10 md:bottom-24 left-0 right-0">
        <div className="text-center max-w-xl mx-auto space-y-4 animate-fade-up">
          <h3 className="text-xl  md:text-3xl font-bold">
            Hai gais,
          </h3>
          <p className="text-sm md:text-xl leading-relaxed">
            Yuk gabung bareng kita seru-seruan
            <br />
            bermain ski dan snowboard saat musim dingin
            <br />
            yang pasti dijamin berkesan dan ga bakal kamu lupain !
          </p>
        </div>
      </div>
    </div>
  )
}
