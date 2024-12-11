"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useParams } from "next/navigation"
import { getBusDetail } from "@/app/actions/dashboard"
import { UserRole } from "@prisma/client"

interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  alamat: string | null
  telepon: string | null
}

interface Bus {
  id: string
  namaBus: string
  kapasitas: number
  peserta: User[]
}

export default function BusDetailPage() {
  const params = useParams()
  const [bus, setBus] = useState<Bus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusDetail = async () => {
      try {
        const result = await getBusDetail(params.id as string)
        if (result.success && result.data) {
          setBus(result.data as Bus)
        } else {
          setError(result.message || "Bus tidak ditemukan")
        }
      } catch (error) {
        setError("Terjadi kesalahan saat mengambil data bus")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBusDetail()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Memuat data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    )
  }

  if (!bus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Bus tidak ditemukan</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{bus.namaBus}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Kapasitas: {bus.peserta.length}/{bus.kapasitas} penumpang
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bus.peserta.map((peserta) => (
                <Card key={peserta.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-lg">
                          {peserta.name || "Tanpa Nama"}
                        </h3>
                        <div className="text-sm text-muted-foreground">{peserta.email}</div>
                      </div>

                      <div className="space-y-2">
                        {peserta.telepon && (
                          <div className="text-sm flex items-center gap-2">
                            <span>📞</span>
                            <span>{peserta.telepon}</span>
                          </div>
                        )}
                        {peserta.alamat && (
                          <div className="text-sm flex items-center gap-2">
                            <span>📍</span>
                            <span>{peserta.alamat}</span>
                          </div>
                        )}
                      </div>

                      <Badge variant="secondary">
                        {peserta.role === UserRole.PESERTA ? 'Peserta' : 'Panitia'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
