import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTAContent() {
  return (
    <section className="relative w-full min-h-screen bg-[#001524] text-white flex flex-col items-center justify-center space-y-8 py-16">
      {/* Heading */}
      <h2 className="text-yellow-400 text-5xl font-bold">Tertarik ?</h2>
      
      {/* Price */}
      <p className="text-2xl">harga mulai dari ₩ 40.000,-</p>
      
      {/* Service Icons */}
      <div className="flex gap-6 my-8">
        {/* Bus Icon */}
        <div className="w-12 h-12 border-2 border-white rounded-lg p-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        </div>
        
        {/* Food Icon */}
        <div className="w-12 h-12 border-2 border-white rounded-lg p-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
          </svg>
        </div>
        
        {/* Ticket Icon */}
        <div className="w-12 h-12 border-2 border-white rounded-lg p-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
          </svg>
        </div>
        
        {/* Ski Icon */}
        <div className="w-12 h-12 border-2 border-white rounded-lg p-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m6.115 5.19.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64" />
          </svg>
        </div>
        
        {/* Cable Car Icon */}
        <div className="w-12 h-12 border-2 border-white rounded-lg p-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
          </svg>
        </div>
      </div>
      
      {/* CTA Text */}
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-semibold">Langsung aja gabung bareng kita</h3>
        <p className="text-xl text-gray-300">klik link daftar di bawah ini !</p>
      </div>
      
      {/* Registration Button */}
      <Link href="/auth/register" className="w-full max-w-md mx-auto px-4">
        <Button className="w-full bg-[#15BFFD] hover:bg-[#15BFFD]/90 text-white text-xl py-6">
          DAFTAR EVENT WINTER SPORT
        </Button>
      </Link>
      
      {/* Panitia Login */}
      <Link 
        href="/auth/login" 
        className="text-gray-400 hover:text-gray-300 transition-colors mt-8"
      >
        LOGIN KHUSUS PANITIA
      </Link>
      
      {/* Forest Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="w-full h-32 bg-[#15BFFD]/20" style={{
          maskImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,0 L50,30 L100,0 L150,30 L200,0 L250,30 L300,0 L350,30 L400,0 L450,30 L500,0 L550,30 L600,0 L650,30 L700,0 L750,30 L800,0 L850,30 L900,0 L950,30 L1000,0 L1050,30 L1100,0 L1150,30 L1200,0 L1250,30 L1300,0 L1350,30 L1400,0 L1450,30 L1500,0 L1550,30 L1600,0 L1650,30 L1700,0 L1750,30 L1800,0 L1850,30 L1900,0 L1950,30 L2000,0 L2000,100 L0,100 Z\' fill=\'black\'/%3E%3C/svg%3E")',
          maskSize: '50px 100%',
          maskRepeat: 'repeat-x'
        }} />
      </div>
    </section>
  );
}
