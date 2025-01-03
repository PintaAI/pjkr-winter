"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { getBusDetail } from "@/app/actions/dashboard"
import { UserRole } from "@prisma/client"

interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  alamat: string | null
  telepon: string | null
  tipeAlat?: 'Snowboard' | 'Ski'
  makanBerat?: boolean
}

interface Bus {
  id: string
  namaBus: string
  kapasitas: number
  peserta: User[]
}

export default function BusDetailPage() {
  const params = useParams()
  const router = useRouter()
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{bus.namaBus}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kapasitas {bus.peserta.length}/{bus.kapasitas} penumpang
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                router.push(`/scan?type=departure&busId=${bus.id}`)
              }}
            >
              Absensi Keberangkatan
            </Button>
            <Button 
              variant="outline"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                router.push(`/scan?type=return&busId=${bus.id}`)
              }}
            >
              Absensi Kepulangan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors">
                  <th className="h-12 px-4 text-left align-middle font-medium">NAMA</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">PHONE</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">STATUS</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">TIPE ALAT</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">MAKAN BERAT</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {bus.peserta.map((peserta) => (
                  <tr key={peserta.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">{peserta.name || "Tanpa Nama"}</td>
                    <td className="p-4 align-middle">{peserta.telepon || "-"}</td>
                    <td className="p-4 align-middle">
                      {peserta.role === UserRole.PESERTA ? 'Peserta' : 'Panitia'}
                    </td>
                    <td className="p-4 align-middle">{peserta.tipeAlat || "-"}</td>
                    <td className="p-4 align-middle">
                      {peserta.makanBerat ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Fill remaining rows up to capacity */}
                {Array(bus.kapasitas - bus.peserta.length)
                  .fill(null)
                  .map((_, index) => (
                    <tr key={`empty-${index}`} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">-</td>
                      <td className="p-4 align-middle">-</td>
                      <td className="p-4 align-middle">-</td>
                      <td className="p-4 align-middle">-</td>
                      <td className="p-4 align-middle">-</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
