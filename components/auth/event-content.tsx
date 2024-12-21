import { Bookmark } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const EventContent = () => {
  return (
    <section className="w-full min-h-screen bg-background relative flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-2">
          <div className="flex items-start">
            <div className="text-yellow-500">
              <Bookmark className="w-6 h-6" />
            </div>
            <h2 className="text-xl ml-2">Kita akan seru-seruan di event ini pada :</h2>
          </div>

          <div className="pl-8 space-y-1">
            <h1 className="text-4xl font-bold">Rabu,</h1>
            <h1 className="text-4xl font-bold">29 Januari 2025</h1>
            <p className="text-muted-foreground">설날 · Seollal · Tahun Baru Lunar</p>
          </div>
        </div>

        <div className="relative">
          <Separator orientation="vertical" className="absolute left-0 h-full w-1 bg-teal-500" />
          <div className="bg-secondary rounded-lg p-6 text-white ml-8 shadow-lg">
            <div className="text-center">
              <p className="text-sm">jam kumpul</p>
              <div className="text-6xl font-bold tracking-wider">07:30</div>
              <p className="text-sm">WKS</p>
            </div>
            <p className="text-sm text-center mt-2 opacity-90">*diharapkan datang tepat waktu / sebelum jam tersebut</p>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h3 className="text-xl">Titik Kumpul di Hari H :</h3>
          <h2 className="text-2xl font-bold">Depan Loteria Stasiun Ansan</h2>
          
          <div className="rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3170.547481649611!2d126.87847117677652!3d37.32765637212455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b6e8c8f596a85%3A0x6c9e09f4a6b56ab6!2s462%2C%20Jungang-daero%2C%20Danwon-gu%2C%20Ansan-si%2C%20Gyeonggi-do!5e0!3m2!1sen!2skr!4v1705459163006!5m2!1sen!2skr"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          
          <p className="text-muted-foreground text-sm">
            462, Jungang-daero, Danwon-gu, Ansan-si, Gyeonggi-do
          </p>
        </div>
      </div>
    </section>
  );
};
