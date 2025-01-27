"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { getBusDetail } from "@/app/actions/dashboard"
import { User as PrismaUser, Bus as PrismaBus, Ticket, OptionalItem as PrismaOptionalItem, StatusPeserta as PrismaStatusPeserta, UserRole, UserPlan } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { PesertaCard } from "@/components/dashboard/peserta-card"
import { Separator } from "@/components/ui/separator"

type PesertaWithRelations = PrismaUser & {
  bus: PrismaBus | null;
  tiket: Ticket[];
  optionalItems: PrismaOptionalItem[];
  status: PrismaStatusPeserta[];
};

interface Bus {
  id: string;
  namaBus: string;
  kapasitas: number;
  peserta: PesertaWithRelations[];
}

export default function BusDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [bus, setBus] = useState<Bus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
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
  const [selectedPeserta, setSelectedPeserta] = useState<PesertaWithRelations | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchBusDetail()
    }
  }, [params.id])

  // Refetch data when drawer closes
  useEffect(() => {
    if (!isDrawerOpen && params.id) {
      fetchBusDetail()
    }
  }, [isDrawerOpen])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Memuat data...</div></div>
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-red-500">{error}</div></div>
  if (!bus) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Bus tidak ditemukan</div></div>

  // Calculate statistics
  const stats = {
    snowboard: bus.peserta.filter(p => p.tipeAlat?.toLowerCase() === 'snowboard').length,
    ski: bus.peserta.filter(p => p.tipeAlat?.toLowerCase() === 'ski').length,
    withOptionalItems: bus.peserta.filter(p => p.optionalItems.length > 0).length,
    sizes: bus.peserta.reduce((acc, p) => {
      if (p.ukuranBaju) {
        acc[p.ukuranBaju] = (acc[p.ukuranBaju] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>),
    attendance: {
      departure: bus.peserta.filter(p => p.status.find(s => s.nama === "Keberangkatan")?.nilai).length,
      return: bus.peserta.filter(p => p.status.find(s => s.nama === "Kepulangan")?.nilai).length
    }
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
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
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <h4 className="font-medium">Alat</h4>
              <div className="flex gap-2">
                <Badge variant="outline">Snowboard: {stats.snowboard}</Badge>
                <Badge variant="outline">Ski: {stats.ski}</Badge>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Makanan</h4>
              <Badge variant="outline">Include: {stats.withOptionalItems}</Badge>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Ukuran Baju</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.sizes).map(([size, count]) => (
                  <Badge key={size} variant="outline">{size}: {count}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Kehadiran</h4>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Berangkat: {stats.attendance.departure}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Pulang: {stats.attendance.return}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Nama</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bus.peserta.map((peserta) => {
                  const isPresent = peserta.status.find(s => s.nama === "Keberangkatan")?.nilai
                  const hasReturned = peserta.status.find(s => s.nama === "Kepulangan")?.nilai
                  
                  return (
                    <TableRow key={peserta.id}>
                      <TableCell 
                        className="font-medium cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedPeserta(peserta)
                          setIsDrawerOpen(true)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`${peserta.role === UserRole.CREW ? "text-blue-600 font-semibold" : ""}`}>
                            {peserta.name || "Tanpa Nama"}
                          </span>
                          {peserta.role === UserRole.CREW && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-600 hover:bg-blue-200">
                              CREW
                            </Badge>
                          )}
                          {peserta.role === UserRole.PANITIA && (
                            <Badge variant="secondary">
                              PANITIA
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          {peserta.status.map((status) => (
                            status.nilai && (
                              <Badge 
                                key={status.nama}
                                variant="outline" 
                                className={`${
                                  status.nama === "Keberangkatan" 
                                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                                    : status.nama === "Kepulangan"
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {status.nama}
                              </Badge>
                            )
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {Array(bus.kapasitas - bus.peserta.length)
                  .fill(null)
                  .map((_, index) => (
                    <TableRow key={`empty-${index}`}>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Kursi Kosong
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Details Drawer */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Detail Peserta</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                {selectedPeserta && (
                  <PesertaCard peserta={selectedPeserta} />
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </CardContent>
      </Card>
    </div>
  )
}
