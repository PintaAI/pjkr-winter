"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Search } from "lucide-react"
import Link from "next/link"
import { formatWon } from "@/lib/utils"
import { getPesertaData, updatePeserta, deletePeserta, getBusData } from "@/app/actions/dashboard"
import { PesertaCard } from "./peserta-card"

interface PesertaForm {
  name: string
  email: string
  alamat: string
  telepon: string
  busId: string | null
}

interface BusData {
  id: string
  namaBus: string
  kapasitas: number
  terisi: number
}

export function ManagePeserta() {
  const [peserta, setPeserta] = useState<any[]>([])
  const [filteredPeserta, setFilteredPeserta] = useState<any[]>([])
  const [buses, setBuses] = useState<BusData[]>([])
  const [editForm, setEditForm] = useState<PesertaForm | null>(null)
  const [selectedPesertaId, setSelectedPesertaId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterPeserta()
  }, [searchQuery, peserta])

  const loadData = async () => {
    try {
      const [pesertaResult, busResult] = await Promise.all([
        getPesertaData(),
        getBusData()
      ])

      if (pesertaResult.success && pesertaResult.data) {
        setPeserta(pesertaResult.data)
        setFilteredPeserta(pesertaResult.data)
      }

      if (busResult.success && busResult.data) {
        setBuses(busResult.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Gagal memuat data")
    }
  }

  const filterPeserta = () => {
    let filtered = peserta

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPeserta(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm || !selectedPesertaId) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updatePeserta(selectedPesertaId, editForm)

      if (result.success) {
        setSuccess(result.message)
        await loadData()
        setSelectedPesertaId(null)
        setEditForm(null)
        setDialogOpen(false)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memproses data peserta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus peserta ini?")) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deletePeserta(id)
      if (result.success) {
        setSuccess(result.message)
        await loadData()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus peserta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowCard = (p: any) => {
    setSelectedPeserta(p)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Search Section */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Drawer untuk PesertaCard */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="border-b">
            <DrawerTitle>Detail Peserta</DrawerTitle>
          </DrawerHeader>
          <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              {selectedPeserta && <PesertaCard peserta={selectedPeserta} />}
            </div>
          </div>
          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Tutup</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Responsive Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden sm:table-cell">Tiket</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead className="hidden sm:table-cell">Total Biaya</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeserta.map((p) => {
              const tiketCost = p.tiket.reduce((acc: number, t: any) => acc + t.harga, 0);
              const sewaanCost = p.sewaan.reduce((acc: number, s: any) => acc + s.hargaSewa, 0);
              const totalCost = tiketCost + sewaanCost;

              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleShowCard(p)}
                      className="hover:underline focus:outline-none"
                    >
                      {p.name}
                    </button>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {p.tiket.map((t: any) => (
                      <Badge
                        key={t.id}
                        variant="secondary"
                        className="mr-1 mb-1"
                      >
                        {t.tipe}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    {p.bus ? (
                      <Badge variant="outline">
                        {p.bus.namaBus}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatWon(totalCost)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                      >
                        <Link href={`/peserta/${p.id}/qr`}>
                          <QrCode className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditForm({
                                name: p.name,
                                email: p.email,
                                alamat: p.alamat || "",
                                telepon: p.telepon || "",
                                busId: p.bus?.id || null
                              })
                              setSelectedPesertaId(p.id)
                              setDialogOpen(true)
                            }}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Peserta</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label>Nama</Label>
                              <Input
                                value={editForm?.name || ""}
                                onChange={(e) => setEditForm(prev => ({
                                  ...prev!,
                                  name: e.target.value
                                }))}
                                required
                                disabled={isLoading}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={editForm?.email || ""}
                                onChange={(e) => setEditForm(prev => ({
                                  ...prev!,
                                  email: e.target.value
                                }))}
                                required
                                disabled={isLoading}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Alamat</Label>
                              <Input
                                value={editForm?.alamat || ""}
                                onChange={(e) => setEditForm(prev => ({
                                  ...prev!,
                                  alamat: e.target.value
                                }))}
                                disabled={isLoading}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Telepon</Label>
                              <Input
                                value={editForm?.telepon || ""}
                                onChange={(e) => setEditForm(prev => ({
                                  ...prev!,
                                  telepon: e.target.value
                                }))}
                                disabled={isLoading}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Bus</Label>
                              <Select
                                value={editForm?.busId || "no_bus"}
                                onValueChange={(value) => setEditForm(prev => ({
                                  ...prev!,
                                  busId: value === "no_bus" ? null : value
                                }))}
                                disabled={isLoading}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih bus" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="no_bus">Tidak ada bus</SelectItem>
                                  {buses.map((bus) => (
                                    <SelectItem 
                                      key={bus.id} 
                                      value={bus.id}
                                      disabled={bus.terisi >= bus.kapasitas && bus.id !== p.bus?.id}
                                    >
                                      {bus.namaBus} ({bus.terisi}/{bus.kapasitas})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex space-x-2">
                              <Button 
                                type="submit"
                                disabled={isLoading}
                              >
                                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedPesertaId(null)
                                  setEditForm(null)
                                  setDialogOpen(false)
                                }}
                                disabled={isLoading}
                              >
                                Batal
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="destructive"
                        onClick={() => handleDelete(p.id)}
                        disabled={isLoading}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
