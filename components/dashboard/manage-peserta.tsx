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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode } from "lucide-react"
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
  const [buses, setBuses] = useState<BusData[]>([])
  const [editForm, setEditForm] = useState<PesertaForm | null>(null)
  const [selectedPesertaId, setSelectedPesertaId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [pesertaResult, busResult] = await Promise.all([
        getPesertaData(),
        getBusData()
      ])

      if (pesertaResult.success && pesertaResult.data) {
        setPeserta(pesertaResult.data)
      }

      if (busResult.success && busResult.data) {
        setBuses(busResult.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Gagal memuat data")
    }
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
    setCardDialogOpen(true)
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

      {/* Dialog untuk PesertaCard */}
      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Peserta</DialogTitle>
          </DialogHeader>
          {selectedPeserta && <PesertaCard peserta={selectedPeserta} />}
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Daftar peserta yang sudah terdaftar</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Tiket</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Sewaan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Biaya</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {peserta.map((p) => {
              // Hitung total biaya
              const tiketCost = p.tiket.reduce((acc: number, t: any) => {
                return acc + t.harga;
              }, 0);

              const sewaanCost = p.sewaan.reduce((acc: number, s: any) => {
                return acc + s.hargaSewa;
              }, 0);

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
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.telepon}</TableCell>
                  <TableCell>
                    {p.tiket.map((t: any) => (
                      <Badge
                        key={t.id}
                        variant="secondary"
                        className="mr-1"
                      >
                        {t.tipe}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    {p.bus ? (
                      <Badge>{p.bus.namaBus}</Badge>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.sewaan.length > 0 ? (
                      <div className="space-y-1">
                        {p.sewaan.map((s: any) => (
                          <Badge
                            key={s.id}
                            variant="outline"
                            className="mr-1"
                          >
                            {s.namaBarang}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.status.length > 0 ? (
                      <div className="space-y-1">
                        {p.status.map((s: any) => (
                          <Badge
                            key={s.id}
                            variant={s.nilai ? "success" : "destructive"}
                            className="mr-1"
                          >
                            {s.nama}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatWon(totalCost)}</TableCell>
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
