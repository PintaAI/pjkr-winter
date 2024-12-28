import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function CTAContent() {
  return (
    <section className="relative w-full min-h-screen bg-background text-white flex flex-col items-center justify-center py-16">
      <div className="-mt-28 flex flex-col items-center space-y-8">
        {/* Heading */}
        <div className="z-10">
          <h2 className="text-accent text-xl font-bold text-center">Siap untuk pengalaman baru berkesan bareng Pejuangkorea?</h2>
        </div>
        
        {/* Price */}
        <div className="z-10">
          <p className="text-center">harga mulai dari ₩ 60.000,-</p>
        </div>

        {/* Icons */}
        <div className="flex justify-center space-x-6 my-4 z-10">
          <Image src="/icons/bis.svg" alt="Transportation" width={40} height={40} />
          <Image src="/icons/makan.svg" alt="Food" width={40} height={40} />
          <Image src="/icons/board.svg" alt="Luggage" width={40} height={40} />
          <Image src="/icons/gondola.svg" alt="Ski Lift" width={40} height={40} />
          <Image src="/icons/tiket.svg" alt="Skiing" width={40} height={40} />
        </div>

        {/* Join Text */}
        <div className="text-center space-y-2 z-10">
          <p className="text-xl font-semibold">Cek juga paket lengkapnya,</p>
          <p className="text-gray-300">klik link daftar di bawah ini!</p>
        </div>
        
        {/* Registration Button */}
        <div className="w-full mx-auto px-4 z-10">
          <Link 
            href="/event-registration" 
            className="block transition-transform hover:scale-105 duration-300 relative"
          >
            <Image 
              src="/tiket.svg" 
              alt="Registration Ticket" 
              width={300} 
              height={150} 
              className="mx-auto"
              priority
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <p className="text-4xl font-bold text-center text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.75)]">Daftar sekarang!</p>
            </div>
          </Link>
        </div>
        
        {/* Panitia Login */}
        <div className="z-10">
          <Link 
            href="/auth/login" 
            className="text-gray-400 text-sm hover:underline hover:text-gray-300 transition-colors mt-8"
          >
            LOGIN KHUSUS PANITIA
          </Link>
        </div>
      </div>
      
      {/* Forest Decoration */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <img src="/forest.png" alt="Forest" className="w-full" />
      </div>

      {/* PJKR Logo */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <Image src="/PJKR.svg" alt="PJKR Winter Sports" width={200} height={50} />
      </div>
    </section>
  );
}
