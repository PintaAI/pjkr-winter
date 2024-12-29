"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPesertaData, updateStatusPeserta } from "@/app/actions/dashboard"
import { useEffect, useState } from "react"
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

  if (loading) {
    return <div className="text-center py-4">Memuat data...</div>
  }

  return (
    <ScrollArea className="h-[900px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tanggal Registrasi</TableHead>
            <TableHead>Status Pembayaran</TableHead>
            <TableHead>Bukti Pembayaran</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name || '-'}</TableCell>
              <TableCell>{user.email}</TableCell>
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
    </ScrollArea>
  )
}
