import Image from "next/image";
import { KakaoMap } from "./kakao-map";

export const ResortContent = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="container mx-auto px-4 py-20">
        <div className="space-y-8">
          <div className="flex justify-center mb-8">
            <Image
              src="/PJKR.svg"
              alt="PJKR Logo"
              width={180}
              height={60}
              priority
            />
          </div>
          <h2 className="text-sm text-center">
            Jadi.. Event Winter kali ini akan diadakan di :
          </h2>
          <div className="absolute left-0 right-0">
          <Image 
            src="/jisan.jpeg" 
            alt="Jisan Forest Resort" 
            width={1920}
            height={1080}
            className="w-full h-[250px] object-cover"
            style={{ objectPosition: '50% 80%' }}
            priority
          />
            <div className="absolute top-4 -right-3 bg-secondary/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-sm">Kesulitan area : <span className="font-semibold">Pemula - Mahir</span></p>
            </div>
          </div>
          <div className="h-[250px]"></div>
          <h3 className="text-center bigfont text-2xl md:text-6xl font-bold">
            JISAN FOREST RESORT SKI
          </h3>
          
          <div className="max-w-2xl px-2 mx-auto text-sm md:text-xl space-y-6">
            <p>
              Jisan Forest Resort Ski adalah salah satu resort ski terbaik di Korea Selatan.
            </p>
            <p>
              Resort ini menjadi destinasi populer bagi wisatawan lokal maupun internasional yang ingin menikmati keindahan musim dingin sambil mencoba berbagai olahraga salju, seperti ski dan snowboard.
            </p>
            <p>
              Resort ini juga dikelilingi oleh hutan pinus yang indah, menciptakan suasana tenang dan pastinya alami serta menyegarkan.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto px-2 space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
              <KakaoMap />
            </div>
            
      
          </div>
        </div>
      </div>
    </div>
  );
};
