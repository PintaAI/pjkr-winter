import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin } from "lucide-react"
import { MountainParallax } from "./mountain-parallax"

export const HomeContent = () => {
  return (
    <>
      <MountainParallax />
      <div className="container relative mx-auto px-4 py-16 space-y-12 min-h-[200vh]">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-2xl mx-auto backdrop-blur-sm py-8 rounded-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground">
            PJKR Winter Event 2024
          </h1>
          <p className="text-lg text-primary-foreground/90">
            Bergabunglah dalam petualangan musim dingin yang tak terlupakan
          </p>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
            <CardContent className="flex items-center gap-4 p-6">
              <CalendarDays className="w-10 h-10 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-card-foreground">Tanggal Event</h3>
                <p className="text-muted-foreground">20-22 Januari 2024</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
            <CardContent className="flex items-center gap-4 p-6">
              <MapPin className="w-10 h-10 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-card-foreground">Lokasi</h3>
                <p className="text-muted-foreground">Resort jinsan korea selatan</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packages */}
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center text-primary-foreground">Pilihan Paket</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-card-foreground">Paket Regular</h3>
                  <p className="text-2xl font-bold text-primary">Rp 100.000</p>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Akses area ski pemula
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Instruktur dasar
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Peralatan standar
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-card-foreground">Paket Lift Gondola</h3>
                  <p className="text-2xl font-bold text-primary">Rp 150.000</p>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Akses Lift Gondola
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Area ski lanjutan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Instruktur profesional
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-8">
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link href="/event-registration">
              Daftar Sekarang
            </Link>
          </Button>
          
          <div className="pt-4">
            <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary" asChild>
              <Link href="/auth/login">
                Login Panitia →
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
