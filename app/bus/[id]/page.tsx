"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { getBusDetail } from "@/app/actions/dashboard"
import { UserRole } from "@prisma/client"

interface StatusPeserta {
  id: string
  nama: string
  nilai: boolean
  tanggal: string | null
  keterangan: string | null
}

interface OptionalItem {
  id: string
  namaItem: string
  harga: number
  deskripsi: string[]
}

interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  alamat: string | null
  telepon: string | null
  tipeAlat?: 'Snowboard' | 'Ski'
  optionalItems: OptionalItem[]
  status: StatusPeserta[]
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
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{bus.namaBus}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kapasitas {bus.peserta.length}/{bus.kapasitas} penumpang
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                router.push(`/scan?type=departure&busId=${bus.id}`)
              }}
            >
              Absensi Keberangkatan
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
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
          {/* Mobile View - Cards */}
          <div className="block sm:hidden space-y-4">
            {bus.peserta.map((peserta) => (
              <Card key={peserta.id}>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{peserta.name || "Tanpa Nama"}</span>
                      <span className="text-sm text-muted-foreground">
                        {peserta.role === UserRole.PESERTA ? 'Peserta' : 'Panitia'}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{peserta.telepon || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipe Alat:</span>
                        <span>{peserta.tipeAlat || "-"}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Optional Items:</span>
                        <div className="pl-2">
                          {peserta.optionalItems.length > 0 ? (
                            peserta.optionalItems.map((item) => (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.namaItem}</span>
                                <span className="text-green-500">✓</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Status Section */}
                    {peserta.status && peserta.status.length > 0 && (
                      <div className="border-t pt-3">
                        <h4 className="font-medium mb-2">Status</h4>
                        <div className="space-y-2">
                          {peserta.status.map((status) => (
                            <div key={status.id} className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">{status.nama}:</span>
                              <div className="flex items-center gap-2">
                                <span className={status.nilai ? "text-green-500" : "text-red-500"}>
                                  {status.nilai ? "✓" : "✗"}
                                </span>
                                {status.tanggal && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(status.tanggal).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {Array(bus.kapasitas - bus.peserta.length)
              .fill(null)
              .map((_, index) => (
                <Card key={`empty-mobile-${index}`}>
                  <CardContent className="py-4">
                    <div className="text-center text-muted-foreground">
                      Kursi Kosong
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden sm:block relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors">
                  <th className="h-12 px-4 text-left align-middle font-medium">NAMA</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">PHONE</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">STATUS</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">TIPE ALAT</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">OPTIONAL ITEMS</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">STATUS PESERTA</th>
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
                      <div className="space-y-1">
                        {peserta.optionalItems.length > 0 ? (
                          peserta.optionalItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-1">
                              
                              <span className="text-green-500">✓</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {peserta.status?.map((status, index) => (
                        <div key={status.id} className="flex items-center gap-1 text-sm">
                          {index > 0 && <span className="text-muted-foreground mx-1">•</span>}
                          <span className="text-muted-foreground">{status.nama}:</span>
                          <span className={status.nilai ? "text-green-500" : "text-red-500"}>
                            {status.nilai ? "✓" : "✗"}
                          </span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
                {Array(bus.kapasitas - bus.peserta.length)
                  .fill(null)
                  .map((_, index) => (
                    <tr key={`empty-${index}`} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">-</td>
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
