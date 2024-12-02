import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin } from "lucide-react"

export const HomeContent = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold">
          PJKR Winter Event 2024
        </h1>
        <p className="text-muted-foreground">
          Bergabunglah dalam petualangan musim dingin yang tak terlupakan
        </p>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <CalendarDays className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Tanggal Event</h3>
              <p className="text-sm text-muted-foreground">20-22 Januari 2024</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Lokasi</h3>
              <p className="text-sm text-muted-foreground">Resort Ski Genting Highland</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages */}
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl font-semibold text-center">Pilihan Paket</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Paket Regular</h3>
                <p className="text-blue-600 font-bold">Rp 100.000</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Akses area ski pemula</li>
                <li>✓ Instruktur dasar</li>
                <li>✓ Peralatan standar</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Paket Lift Gondola</h3>
                <p className="text-blue-600 font-bold">Rp 150.000</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Akses Lift Gondola</li>
                <li>✓ Area ski lanjutan</li>
                <li>✓ Instruktur profesional</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6">
        <Button size="lg" asChild>
          <Link href="/event-registration">
            Daftar Sekarang
          </Link>
        </Button>
        
        <div className="pt-8">
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link href="/auth/login">
              Login Panitia →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
