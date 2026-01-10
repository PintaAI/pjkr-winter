import { Bookmark, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const EventContent = () => {
  return (
    <section className="w-full min-h-screen bg-background relative flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="flex items-start gap-2">
          <Bookmark className="ml-2 w-7 h-7 text-accent mt-0" fill="currentColor" />
          <p className=" mt-1">Kita akan seru-seruan di event ini pada :</p>
        </div>

        {/* Date Section with Extended Separator */}
        <div className="relative pl-8">
          <Separator orientation="vertical" className="absolute left-5 -top-6 h-[150%] w-1 bg-secondary" />
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Rabu,</h1>
            <h2 className="text-3xl font-bold">16 Februari 2026</h2>
            <p className="text-sm text-muted-foreground">설날 · Seollal · Tahun Baru Lunar</p>
          </div>
        </div>

        {/* Time Section */}
        <div className="bg-secondary rounded-lg p-4 mr-8 -ml-4">
        <div className="flex items-center ml-12 space-x-2">
  <span className="text-sm scale-90 text-secondary-foreground">jam kumpul</span>
  <div className="text-6xl  font-bold tracking-wider text-secondary-foreground drop-shadow-[0_4px_4px_rgba(0,0,0,0.75)]">07:30</div>
  <span className="text-sm text-secondary-foreground">WKS</span>
</div>

          <p className="text-xs absolute right-4  scale-75 text-secondary-foreground/80">*diharapkan untuk datang tepat waktu</p>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <div className="space-y-5">
            <p className=" text-center">Titik Kumpul di Hari H :</p>
            <h3 className="text-xl text-center font-semibold">📍 Depan Loteria Stasiun Ansan</h3>
          </div>
          
          <div className="relative rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3170.547481649611!2d126.87847117677652!3d37.32765637212455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b6e8c8f596a85%3A0x6c9e09f4a6b56ab6!2s462%2C%20Jungang-daero%2C%20Danwon-gu%2C%20Ansan-si%2C%20Gyeonggi-do!5e0!3m2!1sen!2skr!4v1705459163006!5m2!1sen!2skr"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-background/70 px-4 py-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <span className="text-sm">462, Jungang-daero, Danwon-gu, Ansan-si, Gyeonggi-do</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
