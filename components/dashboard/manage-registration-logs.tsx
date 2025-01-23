"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBusData, getPesertaData, updateStatusPeserta } from "@/app/actions/dashboard"
import { useEffect, useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { UserPlan } from "@prisma/client"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Registration {
  id: string
  buktiPembayaran: string | null
  status: string
  totalAmount: number
  ticketType: string
  createdAt: Date
  peserta: User[]
}

interface User {
  id: string
  name: string | null
  email: string
  plan: UserPlan
  alamat: string | null
  telepon: string | null
  ukuranBaju: string | null
  ukuranSepatu: string | null
  tiket: any[]
  optionalItems: any[]
  bus: any | null
  status: any[]
  tipeAlat: string | null
  createdAt: Date
  registration: Registration | null
}

// Helper function to check payment status
const hasPembayaranStatus = (status: any[], registration: Registration | null) => {
  const statusVerified = status.some(s => s.nama === "Pembayaran" && s.nilai === true)
  const registrationConfirmed = registration?.status === "CONFIRMED"
  return statusVerified || registrationConfirmed
}

export function ManageRegistrationLogs() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "unverified">("all")
  const [busFilter, setBusFilter] = useState<string>("all")

  // Get unique bus names for filter
  const getUniqueBuses = () => {
    const buses = new Set<string>()
    users.forEach(p => {
      if (p.bus?.namaBus) buses.add(p.bus.namaBus)
    })
    return Array.from(buses)
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getPesertaData()
        if (response.success && response.data) {
          // Sort users by creation date, newest first
          const sortedUsers = [...response.data].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setUsers(sortedUsers as User[])
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search query and status filter
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = (
        (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )

      const matchesStatus = statusFilter === "all" ? true :
        statusFilter === "verified" ? hasPembayaranStatus(user.status, user.registration) :
        !hasPembayaranStatus(user.status, user.registration)

      const matchesBus = busFilter === "all" ? true :
        busFilter === "none" ? !user.bus :
        user.bus?.namaBus.toLowerCase() === busFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesBus
    })
  }, [users, searchQuery, statusFilter, busFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = users.length
    const verified = users.filter(user => hasPembayaranStatus(user.status, user.registration)).length
    const unverified = total - verified
    return { total, verified, unverified }
  }, [users])

  if (loading) {
    return <div className="text-center py-4">Memuat data...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Pendaftar</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Terverifikasi</div>
          <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
        </div>
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Belum Terverifikasi</div>
          <div className="text-2xl font-bold text-red-600">{stats.unverified}</div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Cari berdasarkan nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | "verified" | "unverified") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="verified">Terverifikasi</SelectItem>
            <SelectItem value="unverified">Belum Terverifikasi</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={busFilter}
          onValueChange={(value: string) => setBusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Bus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Bus</SelectItem>
            <SelectItem value="none">Belum Pilih Bus</SelectItem>
            {getUniqueBuses().map((bus) => (
              <SelectItem key={bus} value={bus}>{bus}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Informasi Peserta</TableHead>
              <TableHead>Total Pembayaran</TableHead>
              <TableHead>Tanggal Registrasi</TableHead>
              <TableHead>Status Pembayaran</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Bukti Pembayaran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium">{user.name || '-'}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.registration?.totalAmount ? (
                    <div className="flex flex-col">
                      {user.registration.peserta?.length > 1 ? (
                        <>
                          <span>
                            Rp {Math.floor(user.registration.totalAmount / user.registration.peserta.length).toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            (Total Rp {user.registration.totalAmount.toLocaleString('id-ID')} / {user.registration.peserta.length} peserta)
                          </span>
                        </>
                      ) : (
                        <span>
                          Rp {user.registration.totalAmount.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={hasPembayaranStatus(user.status, user.registration) ? "success" : "destructive"}
                    className="cursor-pointer hover:opacity-80"
                    onClick={async () => {
                      try {
                        const currentStatus = hasPembayaranStatus(user.status, user.registration)
                        const result = await updateStatusPeserta(user.id, "Pembayaran", !currentStatus)
                        
                        if (result.success) {
                          // Refresh data
                          const response = await getPesertaData()
                          if (response.success && response.data) {
                            const sortedUsers = [...response.data].sort((a, b) => 
                              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            )
                            setUsers(sortedUsers as User[])
                          }
                          toast.success("Status pembayaran berhasil diperbarui")
                        } else {
                          toast.error("Gagal memperbarui status pembayaran")
                        }
                      } catch (error) {
                        console.error("Error updating payment status:", error)
                        toast.error("Terjadi kesalahan saat memperbarui status")
                      }
                    }}
                  >
                    {hasPembayaranStatus(user.status, user.registration) ? "Terverifikasi" : "Belum Terverifikasi"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.bus ? (
                    <span className="text-sm">
                      {user.bus.namaBus}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Belum pilih bus
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {user.registration?.buktiPembayaran ? (
                    <Dialog>
                      <DialogTrigger>
                        <div className="relative w-10 h-10 cursor-pointer hover:opacity-80">
                          <Image
                            src={user.registration.buktiPembayaran}
                            alt="Bukti Pembayaran"
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogTitle className="mb-4">Bukti Pembayaran</DialogTitle>
                        <div className="relative w-full h-[500px]">
                          <Image
                            src={user.registration.buktiPembayaran}
                            alt="Bukti Pembayaran"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-muted-foreground">Belum upload</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
